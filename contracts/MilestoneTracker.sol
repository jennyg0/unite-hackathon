// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./MilestoneNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MilestoneTracker
 * @dev Tracks user savings activity and triggers milestone NFT minting
 */
contract MilestoneTracker is Ownable, ReentrancyGuard {
    MilestoneNFT public milestoneNFT;

    // User savings data
    struct UserData {
        uint256 totalDeposited; // Total amount ever deposited (in USD value)
        uint256 firstDepositTime; // Timestamp of first deposit
        uint256 lastDepositTime; // Timestamp of last deposit
        uint256 depositStreak; // Current streak in days
        uint256 longestStreak; // Longest streak achieved
        uint256 referralCount; // Number of users referred
        uint256 educationProgress; // Bitfield for completed modules
        uint256 financialFreedomTarget; // User's FF target amount
    }

    mapping(address => UserData) public userData;

    // Milestone thresholds
    uint256[] public amountMilestones = [
        100e6,
        1000e6,
        5000e6,
        10000e6,
        50000e6,
        100000e6
    ]; // $100, $1k, $5k, $10k, $50k, $100k (in USDC decimals)
    uint256[] public streakMilestones = [7, 30, 90, 180, 365]; // Days
    uint256[] public referralMilestones = [1, 3, 5, 10, 25];

    // Authorized updaters (savings contracts, etc)
    mapping(address => bool) public updaters;

    // Track which milestones have been awarded
    mapping(address => mapping(bytes32 => bool)) public awardedMilestones;

    // Early adopter tracking
    uint256 public earlyAdopterCount;
    uint256 public constant EARLY_ADOPTER_LIMIT = 1000;
    mapping(address => bool) public isEarlyAdopter;

    // Events
    event DepositRecorded(
        address indexed user,
        uint256 amount,
        uint256 totalDeposited
    );
    event StreakUpdated(address indexed user, uint256 streak);
    event ReferralRecorded(address indexed user, address indexed referred);
    event EducationProgressUpdated(address indexed user, uint256 moduleId);
    event FinancialFreedomTargetSet(address indexed user, uint256 target);

    modifier onlyUpdater() {
        require(
            updaters[msg.sender] || msg.sender == owner(),
            "Not authorized updater"
        );
        _;
    }

    constructor(address _milestoneNFT) {
        milestoneNFT = MilestoneNFT(_milestoneNFT);
    }

    /**
     * @dev Record a deposit and check for milestones
     */
    function recordDeposit(
        address user,
        uint256 amountUSD
    ) external onlyUpdater nonReentrant {
        UserData storage data = userData[user];

        // First deposit check
        if (data.firstDepositTime == 0) {
            data.firstDepositTime = block.timestamp;

            // Check early adopter status
            if (
                earlyAdopterCount < EARLY_ADOPTER_LIMIT && !isEarlyAdopter[user]
            ) {
                isEarlyAdopter[user] = true;
                earlyAdopterCount++;
                _mintMilestone(
                    user,
                    MilestoneNFT.MilestoneType.EARLY_ADOPTER,
                    earlyAdopterCount,
                    "Early Adopter",
                    string(
                        abi.encodePacked(
                            "One of the first ",
                            uint2str(EARLY_ADOPTER_LIMIT),
                            " users!"
                        )
                    )
                );
            }

            // First deposit milestone
            _mintMilestone(
                user,
                MilestoneNFT.MilestoneType.FIRST_DEPOSIT,
                amountUSD,
                "First Deposit",
                "Started your savings journey!"
            );
        }

        // Update deposit data
        data.totalDeposited += amountUSD;

        // Update streak
        if (block.timestamp - data.lastDepositTime <= 1 days) {
            data.depositStreak++;
        } else if (block.timestamp - data.lastDepositTime > 2 days) {
            data.depositStreak = 1; // Reset streak
        }

        if (data.depositStreak > data.longestStreak) {
            data.longestStreak = data.depositStreak;
        }

        data.lastDepositTime = block.timestamp;

        emit DepositRecorded(user, amountUSD, data.totalDeposited);
        emit StreakUpdated(user, data.depositStreak);

        // Check amount milestones
        _checkAmountMilestones(user, data.totalDeposited);

        // Check streak milestones
        _checkStreakMilestones(user, data.depositStreak);

        // Check whale status
        if (
            data.totalDeposited >= 1000000e6 &&
            !_hasAwardedMilestone(user, "WHALE")
        ) {
            // $1M
            _markMilestoneAwarded(user, "WHALE");
            _mintMilestone(
                user,
                MilestoneNFT.MilestoneType.WHALE_SAVER,
                data.totalDeposited,
                "Whale Saver",
                "Saved over $1,000,000!"
            );
        }

        // Check financial freedom progress
        if (data.financialFreedomTarget > 0) {
            _checkFinancialFreedomProgress(
                user,
                data.totalDeposited,
                data.financialFreedomTarget
            );
        }
    }

    /**
     * @dev Record a referral
     */
    function recordReferral(
        address referrer,
        address referred
    ) external onlyUpdater {
        userData[referrer].referralCount++;
        emit ReferralRecorded(referrer, referred);

        _checkReferralMilestones(referrer, userData[referrer].referralCount);
    }

    /**
     * @dev Record education module completion
     */
    function recordEducationProgress(
        address user,
        uint256 moduleId
    ) external onlyUpdater {
        require(moduleId < 256, "Invalid module ID");

        userData[user].educationProgress |= (1 << moduleId);
        emit EducationProgressUpdated(user, moduleId);

        // Check if all modules completed (assuming 10 modules)
        if (
            userData[user].educationProgress == 0x3FF &&
            !_hasAwardedMilestone(user, "EDUCATION")
        ) {
            // All 10 bits set
            _markMilestoneAwarded(user, "EDUCATION");
            _mintMilestone(
                user,
                MilestoneNFT.MilestoneType.EDUCATION_COMPLETE,
                10,
                "Education Master",
                "Completed all educational modules!"
            );
        }
    }

    /**
     * @dev Set user's financial freedom target
     */
    function setFinancialFreedomTarget(
        address user,
        uint256 target
    ) external onlyUpdater {
        userData[user].financialFreedomTarget = target;
        emit FinancialFreedomTargetSet(user, target);
    }

    /**
     * @dev Check amount milestones
     */
    function _checkAmountMilestones(
        address user,
        uint256 totalAmount
    ) internal {
        for (uint256 i = 0; i < amountMilestones.length; i++) {
            uint256 milestone = amountMilestones[i];
            bytes32 key = keccak256(abi.encodePacked("AMOUNT", milestone));

            if (totalAmount >= milestone && !awardedMilestones[user][key]) {
                awardedMilestones[user][key] = true;

                _mintMilestone(
                    user,
                    MilestoneNFT.MilestoneType.AMOUNT_SAVED,
                    milestone / 1e6, // Convert to dollars
                    string(
                        abi.encodePacked(
                            "$",
                            uint2str(milestone / 1e6),
                            " Saved"
                        )
                    ),
                    string(
                        abi.encodePacked(
                            "Reached $",
                            uint2str(milestone / 1e6),
                            " in total savings!"
                        )
                    )
                );
            }
        }
    }

    /**
     * @dev Check streak milestones
     */
    function _checkStreakMilestones(address user, uint256 streak) internal {
        for (uint256 i = 0; i < streakMilestones.length; i++) {
            uint256 milestone = streakMilestones[i];
            bytes32 key = keccak256(abi.encodePacked("STREAK", milestone));

            if (streak >= milestone && !awardedMilestones[user][key]) {
                awardedMilestones[user][key] = true;

                _mintMilestone(
                    user,
                    MilestoneNFT.MilestoneType.SAVINGS_STREAK,
                    milestone,
                    string(
                        abi.encodePacked(uint2str(milestone), " Day Streak")
                    ),
                    string(
                        abi.encodePacked(
                            "Saved consistently for ",
                            uint2str(milestone),
                            " days!"
                        )
                    )
                );
            }
        }
    }

    /**
     * @dev Check referral milestones
     */
    function _checkReferralMilestones(
        address user,
        uint256 referralCount
    ) internal {
        for (uint256 i = 0; i < referralMilestones.length; i++) {
            uint256 milestone = referralMilestones[i];
            bytes32 key = keccak256(abi.encodePacked("REFERRAL", milestone));

            if (referralCount >= milestone && !awardedMilestones[user][key]) {
                awardedMilestones[user][key] = true;

                _mintMilestone(
                    user,
                    MilestoneNFT.MilestoneType.REFERRAL_CHAMPION,
                    milestone,
                    string(abi.encodePacked(uint2str(milestone), " Referrals")),
                    string(
                        abi.encodePacked(
                            "Referred ",
                            uint2str(milestone),
                            " friends to save!"
                        )
                    )
                );
            }
        }
    }

    /**
     * @dev Check financial freedom progress
     */
    function _checkFinancialFreedomProgress(
        address user,
        uint256 currentAmount,
        uint256 target
    ) internal {
        uint256 percentage = (currentAmount * 100) / target;
        uint256[] memory ffMilestones = new uint256[](4);
        ffMilestones[0] = 25;
        ffMilestones[1] = 50;
        ffMilestones[2] = 75;
        ffMilestones[3] = 100;

        for (uint256 i = 0; i < ffMilestones.length; i++) {
            uint256 milestone = ffMilestones[i];
            bytes32 key = keccak256(abi.encodePacked("FF", milestone));

            if (percentage >= milestone && !awardedMilestones[user][key]) {
                awardedMilestones[user][key] = true;

                _mintMilestone(
                    user,
                    MilestoneNFT.MilestoneType.FINANCIAL_FREEDOM,
                    milestone,
                    string(
                        abi.encodePacked(uint2str(milestone), "% to Freedom")
                    ),
                    string(
                        abi.encodePacked(
                            "Reached ",
                            uint2str(milestone),
                            "% of your financial freedom goal!"
                        )
                    )
                );
            }
        }
    }

    /**
     * @dev Mint a milestone NFT
     */
    function _mintMilestone(
        address user,
        MilestoneNFT.MilestoneType milestoneType,
        uint256 value,
        string memory title,
        string memory description
    ) internal {
        milestoneNFT.mintMilestone(
            user,
            milestoneType,
            value,
            title,
            description
        );
    }

    /**
     * @dev Check if milestone has been awarded
     */
    function _hasAwardedMilestone(
        address user,
        string memory key
    ) internal view returns (bool) {
        return awardedMilestones[user][keccak256(bytes(key))];
    }

    /**
     * @dev Mark milestone as awarded
     */
    function _markMilestoneAwarded(address user, string memory key) internal {
        awardedMilestones[user][keccak256(bytes(key))] = true;
    }

    /**
     * @dev Convert uint to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Admin functions
     */
    function addUpdater(address updater) external onlyOwner {
        updaters[updater] = true;
    }

    function removeUpdater(address updater) external onlyOwner {
        updaters[updater] = false;
    }

    function updateAmountMilestones(
        uint256[] memory newMilestones
    ) external onlyOwner {
        amountMilestones = newMilestones;
    }

    function updateStreakMilestones(
        uint256[] memory newMilestones
    ) external onlyOwner {
        streakMilestones = newMilestones;
    }

    function updateReferralMilestones(
        uint256[] memory newMilestones
    ) external onlyOwner {
        referralMilestones = newMilestones;
    }
}
