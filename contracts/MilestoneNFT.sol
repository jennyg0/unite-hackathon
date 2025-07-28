// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title MilestoneNFT
 * @dev NFT contract for savings milestones with on-chain SVG generation
 */
contract MilestoneNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Milestone types
    enum MilestoneType {
        FIRST_DEPOSIT, // First deposit made
        SAVINGS_STREAK, // Consistent savings (7, 30, 90 days)
        AMOUNT_SAVED, // Total amount milestones ($100, $1k, $10k, etc)
        FINANCIAL_FREEDOM, // Reached FF number percentage (25%, 50%, 75%, 100%)
        EDUCATION_COMPLETE, // Completed educational modules
        REFERRAL_CHAMPION, // Referred friends
        EARLY_ADOPTER, // One of first users
        WHALE_SAVER // High value saver
    }

    struct Milestone {
        MilestoneType milestoneType;
        uint256 value; // Streak days, amount saved, percentage, etc
        uint256 timestamp; // When achieved
        string title;
        string description;
        string imageURI; // Optional external image
        bool useOnChainImage; // Whether to generate SVG on-chain
    }

    // Token ID to Milestone data
    mapping(uint256 => Milestone) public milestones;

    // User achievements tracking
    mapping(address => mapping(MilestoneType => uint256[]))
        public userMilestones;

    // Authorized minters (savings contract, etc)
    mapping(address => bool) public minters;

    // Colors for different milestone types
    mapping(MilestoneType => string) public milestoneColors;

    // Counter for token IDs
    uint256 private _tokenIdCounter;

    // Events
    event MilestoneAchieved(
        address indexed user,
        uint256 indexed tokenId,
        MilestoneType milestoneType,
        uint256 value
    );

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor() ERC721("Savings Milestone", "SAVE") {
        // Set default colors for milestone types
        milestoneColors[MilestoneType.FIRST_DEPOSIT] = "#10B981"; // Green
        milestoneColors[MilestoneType.SAVINGS_STREAK] = "#3B82F6"; // Blue
        milestoneColors[MilestoneType.AMOUNT_SAVED] = "#F59E0B"; // Amber
        milestoneColors[MilestoneType.FINANCIAL_FREEDOM] = "#8B5CF6"; // Purple
        milestoneColors[MilestoneType.EDUCATION_COMPLETE] = "#EC4899"; // Pink
        milestoneColors[MilestoneType.REFERRAL_CHAMPION] = "#14B8A6"; // Teal
        milestoneColors[MilestoneType.EARLY_ADOPTER] = "#F97316"; // Orange
        milestoneColors[MilestoneType.WHALE_SAVER] = "#6366F1"; // Indigo
    }

    modifier onlyMinter() {
        require(
            minters[msg.sender] || msg.sender == owner(),
            "Not authorized minter"
        );
        _;
    }

    /**
     * @dev Mint a milestone NFT
     */
    function mintMilestone(
        address to,
        MilestoneType milestoneType,
        uint256 value,
        string memory title,
        string memory description
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;

        milestones[tokenId] = Milestone({
            milestoneType: milestoneType,
            value: value,
            timestamp: block.timestamp,
            title: title,
            description: description,
            imageURI: "",
            useOnChainImage: true
        });

        userMilestones[to][milestoneType].push(tokenId);

        _safeMint(to, tokenId);

        emit MilestoneAchieved(to, tokenId, milestoneType, value);

        return tokenId;
    }

    /**
     * @dev Generate SVG image on-chain
     */
    function generateSVG(
        uint256 tokenId
    ) internal view returns (string memory) {
        Milestone memory milestone = milestones[tokenId];
        string memory color = milestoneColors[milestone.milestoneType];

        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
                    "<defs>",
                    '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:',
                    color,
                    ';stop-opacity:0.8" />',
                    '<stop offset="100%" style="stop-color:',
                    color,
                    ';stop-opacity:0.4" />',
                    "</linearGradient>",
                    "</defs>",
                    '<rect width="400" height="400" fill="url(#grad)" rx="20"/>',
                    '<circle cx="200" cy="120" r="60" fill="white" opacity="0.9"/>',
                    '<text x="200" y="130" font-family="Arial" font-size="48" text-anchor="middle" fill="',
                    color,
                    '">',
                    getMilestoneEmoji(milestone.milestoneType),
                    "</text>",
                    '<text x="200" y="220" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">',
                    milestone.title,
                    "</text>",
                    '<text x="200" y="260" font-family="Arial" font-size="16" text-anchor="middle" fill="white" opacity="0.9">',
                    milestone.description,
                    "</text>",
                    '<text x="200" y="340" font-family="Arial" font-size="14" text-anchor="middle" fill="white" opacity="0.7">',
                    "Achieved: ",
                    formatDate(milestone.timestamp),
                    "</text>",
                    "</svg>"
                )
            );
    }

    /**
     * @dev Get emoji for milestone type
     */
    function getMilestoneEmoji(
        MilestoneType milestoneType
    ) internal pure returns (string memory) {
        if (milestoneType == MilestoneType.FIRST_DEPOSIT) return unicode"💰";
        if (milestoneType == MilestoneType.SAVINGS_STREAK) return unicode"🔥";
        if (milestoneType == MilestoneType.AMOUNT_SAVED) return unicode"💎";
        if (milestoneType == MilestoneType.FINANCIAL_FREEDOM)
            return unicode"🎯";
        if (milestoneType == MilestoneType.EDUCATION_COMPLETE)
            return unicode"🎓";
        if (milestoneType == MilestoneType.REFERRAL_CHAMPION)
            return unicode"🤝";
        if (milestoneType == MilestoneType.EARLY_ADOPTER) return unicode"🚀";
        if (milestoneType == MilestoneType.WHALE_SAVER) return unicode"🐋";
        return unicode"⭐";
    }

    /**
     * @dev Format timestamp to date string
     */
    function formatDate(
        uint256 timestamp
    ) internal pure returns (string memory) {
        // Simplified date formatting
        return string(abi.encodePacked("Block ", timestamp.toString()));
    }

    /**
     * @dev Generate metadata JSON
     */
    function generateMetadata(
        uint256 tokenId
    ) internal view returns (string memory) {
        Milestone memory milestone = milestones[tokenId];

        string memory svg = generateSVG(tokenId);
        string memory image = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );

        return
            string(
                abi.encodePacked(
                    "{",
                    '"name": "',
                    milestone.title,
                    " #",
                    tokenId.toString(),
                    '",',
                    '"description": "',
                    milestone.description,
                    '",',
                    '"image": "',
                    milestone.useOnChainImage ? image : milestone.imageURI,
                    '",',
                    '"attributes": [',
                    "{",
                    '"trait_type": "Milestone Type",',
                    '"value": "',
                    getMilestoneTypeName(milestone.milestoneType),
                    '"',
                    "},",
                    "{",
                    '"trait_type": "Value",',
                    '"value": "',
                    milestone.value.toString(),
                    '"',
                    "},",
                    "{",
                    '"trait_type": "Achievement Date",',
                    '"value": "',
                    milestone.timestamp.toString(),
                    '"',
                    "}",
                    "]",
                    "}"
                )
            );
    }

    /**
     * @dev Get milestone type name
     */
    function getMilestoneTypeName(
        MilestoneType milestoneType
    ) internal pure returns (string memory) {
        if (milestoneType == MilestoneType.FIRST_DEPOSIT)
            return "First Deposit";
        if (milestoneType == MilestoneType.SAVINGS_STREAK)
            return "Savings Streak";
        if (milestoneType == MilestoneType.AMOUNT_SAVED) return "Amount Saved";
        if (milestoneType == MilestoneType.FINANCIAL_FREEDOM)
            return "Financial Freedom";
        if (milestoneType == MilestoneType.EDUCATION_COMPLETE)
            return "Education Complete";
        if (milestoneType == MilestoneType.REFERRAL_CHAMPION)
            return "Referral Champion";
        if (milestoneType == MilestoneType.EARLY_ADOPTER)
            return "Early Adopter";
        if (milestoneType == MilestoneType.WHALE_SAVER) return "Whale Saver";
        return "Unknown";
    }

    /**
     * @dev Override tokenURI to return on-chain metadata
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        string memory json = generateMetadata(tokenId);
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /**
     * @dev Check if user has achieved a specific milestone
     */
    function hasAchievedMilestone(
        address user,
        MilestoneType milestoneType
    ) external view returns (bool) {
        return userMilestones[user][milestoneType].length > 0;
    }

    /**
     * @dev Get all milestones for a user
     */
    function getUserMilestones(
        address user
    ) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(user, i);
        }

        return tokenIds;
    }

    /**
     * @dev Admin functions
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function updateMilestoneColor(
        MilestoneType milestoneType,
        string memory color
    ) external onlyOwner {
        milestoneColors[milestoneType] = color;
    }

    function setExternalImage(
        uint256 tokenId,
        string memory imageURI
    ) external onlyOwner {
        milestones[tokenId].imageURI = imageURI;
        milestones[tokenId].useOnChainImage = false;
    }

    /**
     * @dev Disable transfers (soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // Allow minting and burning, but not transfers
        require(
            from == address(0) || to == address(0),
            "Milestone NFTs are soulbound"
        );
    }
}
