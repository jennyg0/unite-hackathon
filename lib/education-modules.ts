export interface EducationModule {
  id: number;
  title: string;
  description: string;
  category: 'basics' | 'saving' | 'defi' | 'advanced';
  duration: number; // minutes
  points: number;
  content: {
    sections: Array<{
      title: string;
      content: string;
      keyPoints: string[];
    }>;
    quiz?: {
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
  };
  icon: string;
  color: string;
}

export const educationModules: EducationModule[] = [
  {
    id: 0,
    title: "What is Financial Freedom?",
    description: "Learn the basics of financial independence and how to calculate your freedom number",
    category: "basics",
    duration: 5,
    points: 100,
    icon: "🎯",
    color: "#8B5CF6",
    content: {
      sections: [
        {
          title: "Understanding Financial Freedom",
          content: "Financial freedom means having enough savings and investments to afford the lifestyle you want without depending on employment income.",
          keyPoints: [
            "Freedom to choose how you spend your time",
            "Not dependent on a paycheck",
            "Your money works for you"
          ]
        },
        {
          title: "The 4% Rule",
          content: "A common rule suggests you can safely withdraw 4% of your savings annually in retirement. This means you need 25x your annual expenses saved.",
          keyPoints: [
            "Annual expenses × 25 = Freedom number",
            "Based on historical market returns",
            "Adjust for your risk tolerance"
          ]
        }
      ],
      quiz: {
        question: "If your annual expenses are $50,000, what's your financial freedom number?",
        options: ["$500,000", "$1,000,000", "$1,250,000", "$2,000,000"],
        correctAnswer: 2,
        explanation: "$50,000 × 25 = $1,250,000. This amount should generate enough returns to cover your expenses."
      }
    }
  },
  {
    id: 1,
    title: "The Power of Compound Interest",
    description: "Discover how time and consistency can multiply your wealth",
    category: "basics",
    duration: 7,
    points: 100,
    icon: "📈",
    color: "#10B981",
    content: {
      sections: [
        {
          title: "Einstein's 8th Wonder",
          content: "Compound interest is when you earn returns on both your initial investment and previously earned returns. It's the snowball effect for money.",
          keyPoints: [
            "Interest earning interest",
            "Time is your biggest asset",
            "Small amounts grow exponentially"
          ]
        },
        {
          title: "Starting Early Matters",
          content: "Starting at 25 vs 35 can double your retirement savings, even with the same monthly contribution.",
          keyPoints: [
            "$200/month at 25 = $525,000 at 65",
            "$200/month at 35 = $245,000 at 65",
            "10 years = 2x difference!"
          ]
        }
      ],
      quiz: {
        question: "What makes compound interest so powerful?",
        options: [
          "High interest rates only",
          "Large initial investments",
          "Time and reinvested earnings",
          "Government bonuses"
        ],
        correctAnswer: 2,
        explanation: "Time and reinvesting your earnings creates exponential growth through compounding."
      }
    }
  },
  {
    id: 2,
    title: "Emergency Funds 101",
    description: "Build your financial safety net before investing",
    category: "saving",
    duration: 6,
    points: 100,
    icon: "🛡️",
    color: "#F59E0B",
    content: {
      sections: [
        {
          title: "Why Emergency Funds?",
          content: "An emergency fund protects you from unexpected expenses without derailing your financial goals or forcing you into debt.",
          keyPoints: [
            "Covers job loss or medical bills",
            "Prevents high-interest debt",
            "Peace of mind"
          ]
        },
        {
          title: "How Much to Save",
          content: "Most experts recommend 3-6 months of expenses. Start with $1,000 as your first milestone.",
          keyPoints: [
            "3 months if stable job",
            "6 months if variable income",
            "Keep in high-yield savings"
          ]
        }
      ],
      quiz: {
        question: "Where should you keep your emergency fund?",
        options: [
          "Stock market",
          "Under your mattress",
          "High-yield savings account",
          "Cryptocurrency"
        ],
        correctAnswer: 2,
        explanation: "Emergency funds need to be liquid and safe. High-yield savings accounts provide both with some interest."
      }
    }
  },
  {
    id: 3,
    title: "Introduction to DeFi",
    description: "Understand decentralized finance and its benefits",
    category: "defi",
    duration: 8,
    points: 150,
    icon: "🏦",
    color: "#3B82F6",
    content: {
      sections: [
        {
          title: "What is DeFi?",
          content: "DeFi stands for Decentralized Finance - financial services without traditional intermediaries like banks.",
          keyPoints: [
            "No middlemen",
            "24/7 availability",
            "Higher yields possible"
          ]
        },
        {
          title: "Benefits Over Traditional Finance",
          content: "DeFi offers transparency, accessibility, and often better returns than traditional savings accounts.",
          keyPoints: [
            "4-8% yields vs 0.5% at banks",
            "Instant transactions",
            "You control your money"
          ]
        }
      ],
      quiz: {
        question: "What's a key advantage of DeFi?",
        options: [
          "Government insurance",
          "Physical branches",
          "Higher potential yields",
          "Paper statements"
        ],
        correctAnswer: 2,
        explanation: "DeFi protocols often offer higher yields than traditional banks due to lower overhead and efficient markets."
      }
    }
  },
  {
    id: 4,
    title: "Dollar-Cost Averaging",
    description: "Learn the strategy that beats timing the market",
    category: "saving",
    duration: 6,
    points: 100,
    icon: "💵",
    color: "#EC4899",
    content: {
      sections: [
        {
          title: "Consistency Beats Timing",
          content: "Dollar-cost averaging (DCA) means investing a fixed amount regularly, regardless of market conditions.",
          keyPoints: [
            "Reduces impact of volatility",
            "No need to time the market",
            "Builds discipline"
          ]
        },
        {
          title: "Why It Works",
          content: "You automatically buy more when prices are low and less when high, averaging out your cost over time.",
          keyPoints: [
            "Removes emotion from investing",
            "Perfect for beginners",
            "Proven long-term strategy"
          ]
        }
      ],
      quiz: {
        question: "What's the main benefit of dollar-cost averaging?",
        options: [
          "Guaranteed profits",
          "Reduces impact of market volatility",
          "Higher returns than lump sum",
          "No fees"
        ],
        correctAnswer: 1,
        explanation: "DCA smooths out market volatility by spreading purchases over time, reducing the risk of bad timing."
      }
    }
  },
  {
    id: 5,
    title: "Understanding Stablecoins",
    description: "Learn about crypto's answer to volatility",
    category: "defi",
    duration: 7,
    points: 150,
    icon: "💰",
    color: "#14B8A6",
    content: {
      sections: [
        {
          title: "What Are Stablecoins?",
          content: "Stablecoins are cryptocurrencies designed to maintain a stable value, usually pegged to the US dollar.",
          keyPoints: [
            "1 USDC = 1 USD",
            "Backed by real assets",
            "Bridge between crypto and fiat"
          ]
        },
        {
          title: "Types of Stablecoins",
          content: "Different stablecoins use different methods to maintain their peg.",
          keyPoints: [
            "Fiat-backed (USDC, USDT)",
            "Crypto-backed (DAI)",
            "Algorithmic (UST - failed)"
          ]
        }
      ],
      quiz: {
        question: "Why are stablecoins useful for saving?",
        options: [
          "High volatility for gains",
          "Stable value with DeFi yields",
          "Mining rewards",
          "Government backing"
        ],
        correctAnswer: 1,
        explanation: "Stablecoins offer the stability of dollars with access to DeFi yields, perfect for savings."
      }
    }
  },
  {
    id: 6,
    title: "Risk Management",
    description: "Protect your wealth while growing it",
    category: "advanced",
    duration: 8,
    points: 150,
    icon: "⚖️",
    color: "#EF4444",
    content: {
      sections: [
        {
          title: "Understanding Risk",
          content: "All investments carry risk. The key is understanding and managing it, not avoiding it entirely.",
          keyPoints: [
            "Higher returns = higher risk",
            "Diversification reduces risk",
            "Only invest what you can afford to lose"
          ]
        },
        {
          title: "Risk Mitigation Strategies",
          content: "Smart investors use multiple strategies to protect their capital while seeking returns.",
          keyPoints: [
            "Diversify across assets",
            "Use stop-losses",
            "Keep emergency fund separate"
          ]
        }
      ],
      quiz: {
        question: "What's the best way to manage investment risk?",
        options: [
          "Avoid all investments",
          "Put everything in one asset",
          "Diversify your portfolio",
          "Only invest in crypto"
        ],
        correctAnswer: 2,
        explanation: "Diversification across different assets and strategies is the most effective way to manage risk."
      }
    }
  },
  {
    id: 7,
    title: "Yield Strategies in DeFi",
    description: "Explore ways to earn passive income",
    category: "defi",
    duration: 10,
    points: 200,
    icon: "🌾",
    color: "#F97316",
    content: {
      sections: [
        {
          title: "Lending Protocols",
          content: "Platforms like Aave and Compound let you lend your assets to earn interest, similar to a savings account but with better rates.",
          keyPoints: [
            "Supply assets, earn interest",
            "Rates vary by demand",
            "Can withdraw anytime"
          ]
        },
        {
          title: "Liquidity Provision",
          content: "Provide liquidity to decentralized exchanges and earn trading fees.",
          keyPoints: [
            "Higher yields than lending",
            "Impermanent loss risk",
            "Best with stable pairs"
          ]
        }
      ],
      quiz: {
        question: "What's a safe DeFi yield strategy for beginners?",
        options: [
          "High-risk liquidity pools",
          "Lending stablecoins",
          "Leveraged trading",
          "Yield farming new tokens"
        ],
        correctAnswer: 1,
        explanation: "Lending stablecoins on established platforms offers good yields with minimal risk for beginners."
      }
    }
  },
  {
    id: 8,
    title: "Building Wealth Habits",
    description: "Small daily actions that lead to financial success",
    category: "basics",
    duration: 6,
    points: 100,
    icon: "🎯",
    color: "#6366F1",
    content: {
      sections: [
        {
          title: "Pay Yourself First",
          content: "Before paying bills or spending on wants, set aside money for savings. Automate it to remove temptation.",
          keyPoints: [
            "Save 10-20% of income",
            "Automate transfers",
            "Treat as non-negotiable"
          ]
        },
        {
          title: "Track Your Progress",
          content: "What gets measured gets managed. Regular check-ins keep you motivated and on track.",
          keyPoints: [
            "Weekly finance reviews",
            "Celebrate milestones",
            "Adjust as needed"
          ]
        }
      ],
      quiz: {
        question: "What's the most important wealth-building habit?",
        options: [
          "Checking prices daily",
          "Consistent saving",
          "Following hot tips",
          "Complex strategies"
        ],
        correctAnswer: 1,
        explanation: "Consistent saving and investing, even small amounts, is the foundation of wealth building."
      }
    }
  },
  {
    id: 9,
    title: "Your DeFi Safety Checklist",
    description: "Stay safe while exploring decentralized finance",
    category: "advanced",
    duration: 8,
    points: 200,
    icon: "🔒",
    color: "#0EA5E9",
    content: {
      sections: [
        {
          title: "Security Best Practices",
          content: "DeFi gives you control, but with great power comes great responsibility. Follow these rules to stay safe.",
          keyPoints: [
            "Use hardware wallets for large amounts",
            "Never share seed phrases",
            "Verify contract addresses"
          ]
        },
        {
          title: "Avoiding Scams",
          content: "If it sounds too good to be true, it probably is. Learn to spot and avoid common DeFi scams.",
          keyPoints: [
            "Research before investing",
            "Avoid 1000% APY promises",
            "Use established protocols"
          ]
        }
      ],
      quiz: {
        question: "What should you NEVER do in DeFi?",
        options: [
          "Use established protocols",
          "Research before investing",
          "Share your seed phrase",
          "Start with small amounts"
        ],
        correctAnswer: 2,
        explanation: "Never share your seed phrase with anyone. It's the master key to your wallet."
      }
    }
  }
]; 