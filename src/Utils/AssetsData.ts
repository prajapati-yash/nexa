import car from "@/app/assets/car1.png"
import evcharge from "@/app/assets/EVcharge1.png"
import washing from "@/app/assets/washing1.png"
import { StaticImageData } from "next/image";
import carMain from "@/app/assets/car.jpg"
import evchargemain from "@/app/assets/EvCharge.jpg"
import washingMain from "@/app/assets/laundromat.jpg"
// Asset data type definition
export interface Asset {
  id: string;
  image: string | StaticImageData;
  mainImage: string | StaticImageData;
  title: string;
  description: string;
  annualYield: number; // percentage
  boringIndex: number; // 1-10 scale
  location: string;
  usdcValue: number;
  funded?: boolean; // Optional funded status for blockchain assets
  nextPayout: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  powerSaved: {
    amount: number;
    unit: string; // e.g., "kWh", "MW"
  };
  whyThisWorks: string[]; // detailed description points
  locationOnMap: {
    lat: number;
    lng: number;
    address: string;
  };
  smartContractAddress: string;
  proof: {
    fileName: string;
    url: string; // PDF URL
  };
  category: string;
  fundingProgress: number; // percentage of funding completed
  minimumInvestment: number;
  totalRequired: number;
  investorsCount: number;
  status: 'active' | 'funded' | 'upcoming' | 'completed';
}

// Sample asset data
export const assetsData: Asset[] = [
  {
    id: "asset-001",
    image: car,
    mainImage: carMain,
    title: "Automated Car Wash Center - Houston",
    description: "High-tech automatic car wash with water recycling system, catering to urban car owners with subscription-based revenue model.",
    annualYield: 11.3,
    boringIndex: 4,
    location: "Houston, Texas, USA",
    usdcValue: 15000,
    nextPayout: { days: 12, hours: 5, minutes: 18, seconds: 40 },
    powerSaved: { amount: 6000, unit: "liters/month" },
    whyThisWorks: [
      "Car ownership in Houston is above 90% with consistent demand",
      "Subscription model ensures recurring revenue",
      "Water recycling system cuts costs by 70%",
      "Prime location near commercial hub with high daily traffic",
      "Partnership with fleet operators for bulk wash contracts"
    ],
    locationOnMap: {
      lat: 29.7604,
      lng: -95.3698,
      address: "456 Market St, Houston, TX 77002"
    },
    smartContractAddress: "0x1234567890abcdef1234567890abcdef12345678",
    proof: {
      fileName: "Houston_CarWash_BusinessPlan.pdf",
      url: "/documents/houston-carwash-business-plan.pdf"
    },
    category: "Car Wash",
    fundingProgress: 60,
    minimumInvestment: 1000,
    totalRequired: 150000,
    investorsCount: 35,
    status: "active"
  },
  {
    id: "asset-002",
    image: evcharge,
    mainImage: evchargemain,
    title: "EV Charging Hub - San Francisco",
    description: "Fast-charging electric vehicle hub in downtown San Francisco with 20 ultra-fast chargers and green energy sourcing.",
    annualYield: 16.8,
    boringIndex: 5,
    location: "San Francisco, California, USA",
    usdcValue: 25000,
    nextPayout: { days: 5, hours: 10, minutes: 44, seconds: 12 },
    powerSaved: { amount: 1200, unit: "kg CO2/month" },
    whyThisWorks: [
      "California is the EV capital of the US",
      "Downtown location ensures constant demand",
      "Partnership with ride-sharing EV fleets",
      "Government incentives reduce infrastructure cost",
      "Premium pricing model for high-speed charging"
    ],
    locationOnMap: {
      lat: 37.7749,
      lng: -122.4194,
      address: "789 Battery St, San Francisco, CA 94111"
    },
    smartContractAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdef",
    proof: {
      fileName: "SF_EVCharging_Report.pdf",
      url: "/documents/sf-evcharging-report.pdf"
    },
    category: "EV Charging",
    fundingProgress: 80,
    minimumInvestment: 2000,
    totalRequired: 300000,
    investorsCount: 52,
    status: "upcoming"
  },
  {
    id: "asset-003",
    image: washing,
    mainImage: washingMain,
    title: "Smart Laundromat - New York",
    description: "Automated laundromat chain with cashless payments, eco-friendly washing machines, and 24/7 customer access.",
    annualYield: 13.5,
    boringIndex: 3,
    location: "Brooklyn, New York, USA",
    usdcValue: 10000,
    nextPayout: { days: 9, hours: 3, minutes: 25, seconds: 50 },
    powerSaved: { amount: 400, unit: "kWh/month" },
    whyThisWorks: [
      "High population density with consistent laundry demand",
      "Eco-friendly machines reduce electricity and water use",
      "Digital payment integration increases customer convenience",
      "24/7 access attracts working professionals and students",
      "Chain model enables easy expansion into nearby neighborhoods"
    ],
    locationOnMap: {
      lat: 40.6782,
      lng: -73.9442,
      address: "321 Bedford Ave, Brooklyn, NY 11211"
    },
    smartContractAddress: "0x9876543210abcdef9876543210abcdef98765432",
    proof: {
      fileName: "NY_Laundromat_Proposal.pdf",
      url: "/documents/ny-laundromat-proposal.pdf"
    },
    category: "Laundromat",
    fundingProgress: 50,
    minimumInvestment: 500,
    totalRequired: 80000,
    investorsCount: 20,
    status: "funded"
  }
];

// Helper functions
export const getAssetById = (id: string): Asset | undefined => {
  return assetsData.find(asset => asset.id === id);
};

export const getAssetsByCategory = (category: string): Asset[] => {
  return assetsData.filter(asset => asset.category === category);
};

export const getAssetsByStatus = (status: Asset['status']): Asset[] => {
  return assetsData.filter(asset => asset.status === status);
};

export const getActiveAssets = (): Asset[] => {
  return assetsData.filter(asset => asset.status === 'active');
};

export const calculateTotalUSDCValue = (): number => {
  return assetsData.reduce((total, asset) => total + asset.usdcValue, 0);
};

export const formatNextPayout = (nextPayout: Asset['nextPayout']): string => {
  return `${nextPayout.days}d ${nextPayout.hours}h ${nextPayout.minutes}m ${nextPayout.seconds}s`;
};

export const categories = [
  "Solar Energy",
  "Wind Energy",
  "EV Infrastructure",
  "Energy Storage",
  "Hydroelectric"
];