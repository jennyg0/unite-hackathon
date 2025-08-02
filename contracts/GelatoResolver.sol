// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AutomatedDeposits.sol";

/**
 * @title GelatoResolver
 * @dev Gelato resolver contract for automated deposit execution
 * This contract checks which deposits are ready and provides execution data
 */
contract GelatoResolver {
    AutomatedDeposits public immutable automatedDeposits;
    
    constructor(address _automatedDeposits) {
        automatedDeposits = AutomatedDeposits(_automatedDeposits);
    }
    
    /**
     * @dev Gelato checker function - determines if execution is needed
     * @param userAddresses Array of user addresses to check
     * @param scheduleIds Array of schedule IDs to check
     * @return canExec Whether execution should happen
     * @return execPayload The calldata for execution
     */
    function checker(
        address[] calldata userAddresses,
        uint256[] calldata scheduleIds
    ) external view returns (bool canExec, bytes memory execPayload) {
        require(userAddresses.length == scheduleIds.length, "Array length mismatch");
        
        // Find the first executable schedule
        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (isScheduleReady(userAddresses[i], scheduleIds[i])) {
                // Found one ready - return execution data
                execPayload = abi.encodeCall(
                    automatedDeposits.executeDeposit,
                    (userAddresses[i], scheduleIds[i])
                );
                return (true, execPayload);
            }
        }
        
        // No schedules ready
        return (false, "");
    }
    
    /**
     * @dev Check if a specific schedule is ready for execution
     */
    function isScheduleReady(address user, uint256 scheduleId) public view returns (bool) {
        try automatedDeposits.schedules(user, scheduleId) returns (
            address scheduleUser,
            address token,
            uint256 amount,
            uint256 frequency,
            uint256 nextDeposit,
            uint256 totalDeposited,
            bool isActive,
            address recipient
        ) {
            // Suppress unused variable warnings
            scheduleUser; token; amount; frequency; totalDeposited; recipient;
            
            return isActive && block.timestamp >= nextDeposit;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Get all schedules that are ready for execution (for off-chain monitoring)
     * @param users Array of user addresses to check
     * @param maxSchedulesPerUser Maximum schedule ID to check per user
     * @return readyUsers Users with ready schedules
     * @return readyScheduleIds Corresponding schedule IDs
     */
    function getReadySchedules(
        address[] calldata users,
        uint256 maxSchedulesPerUser
    ) external view returns (
        address[] memory readyUsers,
        uint256[] memory readyScheduleIds
    ) {
        // Temporary arrays to collect results
        address[] memory tempUsers = new address[](users.length * maxSchedulesPerUser);
        uint256[] memory tempScheduleIds = new uint256[](users.length * maxSchedulesPerUser);
        uint256 count = 0;
        
        for (uint256 i = 0; i < users.length; i++) {
            uint256 userScheduleCount = automatedDeposits.userScheduleCount(users[i]);
            uint256 maxToCheck = userScheduleCount > maxSchedulesPerUser ? maxSchedulesPerUser : userScheduleCount;
            
            for (uint256 j = 0; j < maxToCheck; j++) {
                if (isScheduleReady(users[i], j)) {
                    tempUsers[count] = users[i];
                    tempScheduleIds[count] = j;
                    count++;
                }
            }
        }
        
        // Resize arrays to actual count
        readyUsers = new address[](count);
        readyScheduleIds = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            readyUsers[i] = tempUsers[i];
            readyScheduleIds[i] = tempScheduleIds[i];
        }
    }
    
    /**
     * @dev Simple checker for a single user/schedule pair
     */
    function checkSingle(
        address user,
        uint256 scheduleId
    ) external view returns (bool canExec, bytes memory execPayload) {
        if (isScheduleReady(user, scheduleId)) {
            execPayload = abi.encodeCall(
                automatedDeposits.executeDeposit,
                (user, scheduleId)
            );
            return (true, execPayload);
        }
        
        return (false, "");
    }
}