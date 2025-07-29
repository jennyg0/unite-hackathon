# Foundry deployment commands

# Install dependencies
install:
	forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Build contracts
build:
	forge build

# Test contracts
test:
	forge test -vvv

# Deploy to Polygon Amoy Testnet (recommended for testing)
deploy-testnet:
	@echo "🚀 Deploying to Polygon Amoy Testnet..."
	forge script script/DeployAutomatedDeposits.s.sol --rpc-url polygonAmoy --broadcast --verify

# Deploy to Base Sepolia (alternative testnet)
deploy-base-testnet:
	@echo "🚀 Deploying to Base Sepolia..."
	forge script script/DeployAutomatedDeposits.s.sol --rpc-url baseSepolia --broadcast --verify

# Deploy to Polygon Mainnet (production)
deploy-polygon:
	@echo "🚀 Deploying to Polygon Mainnet..."
	forge script script/DeployAutomatedDeposits.s.sol --rpc-url polygon --broadcast --verify

# Deploy to Base Mainnet (alternative production)
deploy-base:
	@echo "🚀 Deploying to Base Mainnet..."
	forge script script/DeployAutomatedDeposits.s.sol --rpc-url base --broadcast --verify

# Clean build artifacts
clean:
	forge clean

# Check gas usage
gas-report:
	forge test --gas-report

# Format code
fmt:
	forge fmt

.PHONY: install build test deploy-testnet deploy-base-testnet deploy-polygon deploy-base clean gas-report fmt