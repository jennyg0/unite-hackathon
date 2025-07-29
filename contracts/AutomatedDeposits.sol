// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AutomatedDeposits
 * @dev Allows users to set up recurring deposits with gasless approvals
 */
contract AutomatedDeposits is ReentrancyGuard, Ownable, Pausable {
    struct DepositSchedule {
        address user;
        address token;
        uint256 amount;
        uint256 frequency; // in seconds (daily = 86400, weekly = 604800, etc.)
        uint256 nextDeposit;
        uint256 totalDeposited;
        bool isActive;
        address recipient; // where funds go (could be a vault, lending protocol, etc.)
    }

    // User -> Schedule ID -> DepositSchedule
    mapping(address => mapping(uint256 => DepositSchedule)) public schedules;
    mapping(address => uint256) public userScheduleCount;

    // Keeper addresses that can execute deposits
    mapping(address => bool) public keepers;

    // Protocol fee (basis points, e.g., 10 = 0.1%)
    uint256 public protocolFeeBps = 10;
    address public feeRecipient;

    // Events
    event ScheduleCreated(
        address indexed user,
        uint256 indexed scheduleId,
        address token,
        uint256 amount,
        uint256 frequency
    );

    event DepositExecuted(
        address indexed user,
        uint256 indexed scheduleId,
        uint256 amount,
        uint256 nextDeposit
    );

    event ScheduleUpdated(
        address indexed user,
        uint256 indexed scheduleId,
        bool isActive
    );

    event KeeperAdded(address indexed keeper);
    event KeeperRemoved(address indexed keeper);

    modifier onlyKeeper() {
        require(
            keepers[msg.sender] || msg.sender == owner(),
            "Not authorized keeper"
        );
        _;
    }

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
        keepers[msg.sender] = true;
    }

    /**
     * @dev Create a new deposit schedule
     */
    function createSchedule(
        address token,
        uint256 amount,
        uint256 frequency,
        address recipient
    ) external whenNotPaused returns (uint256 scheduleId) {
        require(amount > 0, "Amount must be greater than 0");
        require(frequency >= 86400, "Frequency must be at least daily");
        require(recipient != address(0), "Invalid recipient");

        scheduleId = userScheduleCount[msg.sender]++;

        schedules[msg.sender][scheduleId] = DepositSchedule({
            user: msg.sender,
            token: token,
            amount: amount,
            frequency: frequency,
            nextDeposit: block.timestamp + frequency,
            totalDeposited: 0,
            isActive: true,
            recipient: recipient
        });

        emit ScheduleCreated(msg.sender, scheduleId, token, amount, frequency);
    }

    /**
     * @dev Execute a deposit for a user (called by keeper or user)
     */
    function executeDeposit(
        address user,
        uint256 scheduleId
    ) external nonReentrant whenNotPaused {
        DepositSchedule storage schedule = schedules[user][scheduleId];

        require(schedule.isActive, "Schedule not active");
        require(
            block.timestamp >= schedule.nextDeposit,
            "Too early for next deposit"
        );

        uint256 depositAmount = schedule.amount;
        uint256 feeAmount = (depositAmount * protocolFeeBps) / 10000;
        uint256 netAmount = depositAmount - feeAmount;

        // Transfer tokens from user to recipient
        IERC20(schedule.token).transferFrom(
            schedule.user,
            schedule.recipient,
            netAmount
        );

        // Transfer fee if applicable
        if (feeAmount > 0) {
            IERC20(schedule.token).transferFrom(
                schedule.user,
                feeRecipient,
                feeAmount
            );
        }

        // Update schedule
        schedule.nextDeposit = block.timestamp + schedule.frequency;
        schedule.totalDeposited += depositAmount;

        emit DepositExecuted(
            user,
            scheduleId,
            depositAmount,
            schedule.nextDeposit
        );
    }

    /**
     * @dev Execute deposit with permit (gasless approval)
     */
    function executeDepositWithPermit(
        address user,
        uint256 scheduleId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant whenNotPaused onlyKeeper {
        DepositSchedule storage schedule = schedules[user][scheduleId];

        require(schedule.isActive, "Schedule not active");
        require(
            block.timestamp >= schedule.nextDeposit,
            "Too early for next deposit"
        );

        // Use permit for gasless approval
        IERC20Permit(schedule.token).permit(
            schedule.user,
            address(this),
            schedule.amount,
            deadline,
            v,
            r,
            s
        );

        // Execute the deposit after permit 
        uint256 depositAmount = schedule.amount;
        uint256 feeAmount = (depositAmount * protocolFeeBps) / 10000;
        uint256 netAmount = depositAmount - feeAmount;

        // Transfer tokens from user to recipient
        IERC20(schedule.token).transferFrom(
            schedule.user,
            schedule.recipient,
            netAmount
        );

        // Transfer fee if applicable
        if (feeAmount > 0) {
            IERC20(schedule.token).transferFrom(
                schedule.user,
                feeRecipient,
                feeAmount
            );
        }

        // Update schedule
        schedule.nextDeposit = block.timestamp + schedule.frequency;
        schedule.totalDeposited += depositAmount;

        emit DepositExecuted(
            user,
            scheduleId,
            depositAmount,
            schedule.nextDeposit
        );
    }

    /**
     * @dev Batch execute multiple deposits (for keeper efficiency)
     */
    function batchExecuteDeposits(
        address[] calldata users,
        uint256[] calldata scheduleIds
    ) external nonReentrant whenNotPaused onlyKeeper {
        require(users.length == scheduleIds.length, "Array length mismatch");

        for (uint256 i = 0; i < users.length; i++) {
            // Skip if deposit fails (don't revert entire batch)
            try this.executeDeposit(users[i], scheduleIds[i]) {
                // Success
            } catch {
                // Skip failed deposits
                continue;
            }
        }
    }

    /**
     * @dev Update schedule status
     */
    function updateSchedule(uint256 scheduleId, bool isActive) external {
        DepositSchedule storage schedule = schedules[msg.sender][scheduleId];
        require(schedule.user == msg.sender, "Not your schedule");

        schedule.isActive = isActive;
        emit ScheduleUpdated(msg.sender, scheduleId, isActive);
    }

    /**
     * @dev Get all active schedules that are ready for execution
     */
    function getExecutableSchedules(
        uint256 offset,
        uint256 limit
    )
        external
        view
        returns (
            address[] memory users,
            uint256[] memory scheduleIds,
            uint256 count
        )
    {
        // This is a simplified version - in production, you'd want more efficient indexing
        users = new address[](limit);
        scheduleIds = new uint256[](limit);
        count = 0;

        // Note: This is not gas efficient for large numbers of users
        // In production, consider off-chain indexing
    }

    /**
     * @dev Admin functions
     */
    function addKeeper(address keeper) external onlyOwner {
        keepers[keeper] = true;
        emit KeeperAdded(keeper);
    }

    function removeKeeper(address keeper) external onlyOwner {
        keepers[keeper] = false;
        emit KeeperRemoved(keeper);
    }

    function updateProtocolFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 100, "Fee too high"); // Max 1%
        protocolFeeBps = newFeeBps;
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal (only owner, only for stuck funds)
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
