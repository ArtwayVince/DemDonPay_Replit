import { db } from "./db";
import { organizations } from "@shared/schema";

const nigerianOrganizations = [
  // Federal Government Bodies
  { name: "Central Bank of Nigeria (CBN)", slug: "cbn", type: "government", sector: "government", state: "Federal" },
  { name: "Nigerian National Petroleum Corporation (NNPC)", slug: "nnpc", type: "government", sector: "oil-gas", state: "Federal" },
  { name: "Federal Inland Revenue Service (FIRS)", slug: "firs", type: "government", sector: "government", state: "Federal" },
  { name: "Economic and Financial Crimes Commission (EFCC)", slug: "efcc", type: "government", sector: "government", state: "Federal" },
  { name: "Independent National Electoral Commission (INEC)", slug: "inec", type: "government", sector: "government", state: "Federal" },
  { name: "Nigerian Communications Commission (NCC)", slug: "ncc", type: "government", sector: "government", state: "Federal" },
  { name: "National Agency for Food and Drug Administration (NAFDAC)", slug: "nafdac", type: "government", sector: "government", state: "Federal" },
  { name: "Corporate Affairs Commission (CAC)", slug: "cac", type: "government", sector: "government", state: "Federal" },
  { name: "Nigerian Immigration Service (NIS)", slug: "nis", type: "government", sector: "government", state: "Federal" },
  { name: "Federal Civil Service Commission", slug: "fcsc", type: "government", sector: "government", state: "Federal" },
  
  // State Governments
  { name: "Lagos State Government", slug: "lagos-state-govt", type: "government", sector: "government", state: "Lagos" },
  { name: "Rivers State Government", slug: "rivers-state-govt", type: "government", sector: "government", state: "Rivers" },
  { name: "Kano State Government", slug: "kano-state-govt", type: "government", sector: "government", state: "Kano" },
  { name: "Kaduna State Government", slug: "kaduna-state-govt", type: "government", sector: "government", state: "Kaduna" },
  { name: "Oyo State Government", slug: "oyo-state-govt", type: "government", sector: "government", state: "Oyo" },
  { name: "Edo State Government", slug: "edo-state-govt", type: "government", sector: "government", state: "Edo" },
  { name: "Delta State Government", slug: "delta-state-govt", type: "government", sector: "government", state: "Delta" },
  { name: "Enugu State Government", slug: "enugu-state-govt", type: "government", sector: "government", state: "Enugu" },
  { name: "Ogun State Government", slug: "ogun-state-govt", type: "government", sector: "government", state: "Ogun" },
  { name: "Abuja (FCT) Administration", slug: "fct-admin", type: "government", sector: "government", state: "FCT" },
  
  // Commercial Banks
  { name: "GTBank (Guaranty Trust Bank)", slug: "gtbank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Zenith Bank", slug: "zenith-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Access Bank", slug: "access-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "First Bank of Nigeria", slug: "first-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "United Bank for Africa (UBA)", slug: "uba", type: "private", sector: "banking", state: "Lagos" },
  { name: "Ecobank Nigeria", slug: "ecobank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Fidelity Bank", slug: "fidelity-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Stanbic IBTC Bank", slug: "stanbic-ibtc", type: "private", sector: "banking", state: "Lagos" },
  { name: "Union Bank of Nigeria", slug: "union-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Sterling Bank", slug: "sterling-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "FCMB (First City Monument Bank)", slug: "fcmb", type: "private", sector: "banking", state: "Lagos" },
  { name: "Wema Bank", slug: "wema-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Polaris Bank", slug: "polaris-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Heritage Bank", slug: "heritage-bank", type: "private", sector: "banking", state: "Lagos" },
  { name: "Keystone Bank", slug: "keystone-bank", type: "private", sector: "banking", state: "Lagos" },
  
  // Telecommunications
  { name: "MTN Nigeria", slug: "mtn", type: "private", sector: "telecom", state: "Lagos" },
  { name: "Airtel Nigeria", slug: "airtel", type: "private", sector: "telecom", state: "Lagos" },
  { name: "Globacom (Glo)", slug: "glo", type: "private", sector: "telecom", state: "Lagos" },
  { name: "9mobile", slug: "9mobile", type: "private", sector: "telecom", state: "Lagos" },
  
  // Oil & Gas
  { name: "Shell Nigeria", slug: "shell-nigeria", type: "private", sector: "oil-gas", state: "Rivers" },
  { name: "Chevron Nigeria", slug: "chevron-nigeria", type: "private", sector: "oil-gas", state: "Lagos" },
  { name: "Total Nigeria", slug: "total-nigeria", type: "private", sector: "oil-gas", state: "Lagos" },
  { name: "ExxonMobil Nigeria", slug: "exxonmobil-nigeria", type: "private", sector: "oil-gas", state: "Rivers" },
  { name: "Seplat Energy", slug: "seplat", type: "private", sector: "oil-gas", state: "Lagos" },
  { name: "Oando PLC", slug: "oando", type: "private", sector: "oil-gas", state: "Lagos" },
  { name: "Conoil PLC", slug: "conoil", type: "private", sector: "oil-gas", state: "Lagos" },
  
  // Manufacturing & Conglomerates
  { name: "Dangote Group", slug: "dangote", type: "private", sector: "other", state: "Lagos" },
  { name: "Flour Mills of Nigeria", slug: "flour-mills", type: "private", sector: "other", state: "Lagos" },
  { name: "Nestle Nigeria", slug: "nestle", type: "private", sector: "other", state: "Lagos" },
  { name: "Unilever Nigeria", slug: "unilever", type: "private", sector: "other", state: "Lagos" },
  { name: "PZ Cussons Nigeria", slug: "pz-cussons", type: "private", sector: "other", state: "Lagos" },
  { name: "Nigerian Breweries", slug: "nigerian-breweries", type: "private", sector: "other", state: "Lagos" },
  { name: "Guinness Nigeria", slug: "guinness", type: "private", sector: "other", state: "Lagos" },
  { name: "Cadbury Nigeria", slug: "cadbury", type: "private", sector: "other", state: "Lagos" },
  { name: "Honeywell Flour Mills", slug: "honeywell", type: "private", sector: "other", state: "Lagos" },
  
  // Universities (Federal)
  { name: "University of Lagos (UNILAG)", slug: "unilag", type: "government", sector: "education", state: "Lagos" },
  { name: "University of Ibadan (UI)", slug: "ui", type: "government", sector: "education", state: "Oyo" },
  { name: "Ahmadu Bello University (ABU)", slug: "abu", type: "government", sector: "education", state: "Kaduna" },
  { name: "University of Nigeria, Nsukka (UNN)", slug: "unn", type: "government", sector: "education", state: "Enugu" },
  { name: "Obafemi Awolowo University (OAU)", slug: "oau", type: "government", sector: "education", state: "Osun" },
  { name: "University of Benin (UNIBEN)", slug: "uniben", type: "government", sector: "education", state: "Edo" },
  { name: "University of Port Harcourt (UNIPORT)", slug: "uniport", type: "government", sector: "education", state: "Rivers" },
  { name: "University of Ilorin (UNILORIN)", slug: "unilorin", type: "government", sector: "education", state: "Kwara" },
  { name: "Federal University of Technology, Akure (FUTA)", slug: "futa", type: "government", sector: "education", state: "Ondo" },
  { name: "Federal University of Technology, Owerri (FUTO)", slug: "futo", type: "government", sector: "education", state: "Imo" },
  
  // Universities (State & Private)
  { name: "Lagos State University (LASU)", slug: "lasu", type: "government", sector: "education", state: "Lagos" },
  { name: "Covenant University", slug: "covenant", type: "private", sector: "education", state: "Ogun" },
  { name: "Babcock University", slug: "babcock", type: "private", sector: "education", state: "Ogun" },
  { name: "Afe Babalola University", slug: "abuad", type: "private", sector: "education", state: "Ekiti" },
  { name: "Landmark University", slug: "landmark", type: "private", sector: "education", state: "Kwara" },
  
  // Teaching Hospitals
  { name: "Lagos University Teaching Hospital (LUTH)", slug: "luth", type: "government", sector: "healthcare", state: "Lagos" },
  { name: "University College Hospital (UCH), Ibadan", slug: "uch-ibadan", type: "government", sector: "healthcare", state: "Oyo" },
  { name: "Ahmadu Bello University Teaching Hospital (ABUTH)", slug: "abuth", type: "government", sector: "healthcare", state: "Kaduna" },
  { name: "University of Nigeria Teaching Hospital (UNTH)", slug: "unth", type: "government", sector: "healthcare", state: "Enugu" },
  { name: "University of Benin Teaching Hospital (UBTH)", slug: "ubth", type: "government", sector: "healthcare", state: "Edo" },
  { name: "National Hospital, Abuja", slug: "national-hospital-abuja", type: "government", sector: "healthcare", state: "FCT" },
  
  // Insurance Companies
  { name: "Leadway Assurance", slug: "leadway", type: "private", sector: "other", state: "Lagos" },
  { name: "AXA Mansard Insurance", slug: "axa-mansard", type: "private", sector: "other", state: "Lagos" },
  { name: "AIICO Insurance", slug: "aiico", type: "private", sector: "other", state: "Lagos" },
  { name: "Custodian Insurance", slug: "custodian-insurance", type: "private", sector: "other", state: "Lagos" },
  
  // Technology & Fintech
  { name: "Interswitch", slug: "interswitch", type: "private", sector: "other", state: "Lagos" },
  { name: "Flutterwave", slug: "flutterwave", type: "private", sector: "other", state: "Lagos" },
  { name: "Paystack", slug: "paystack", type: "private", sector: "other", state: "Lagos" },
  { name: "Kuda Bank", slug: "kuda", type: "private", sector: "banking", state: "Lagos" },
  { name: "Carbon (Paylater)", slug: "carbon", type: "private", sector: "banking", state: "Lagos" },
  { name: "OPay", slug: "opay", type: "private", sector: "other", state: "Lagos" },
  { name: "PalmPay", slug: "palmpay", type: "private", sector: "other", state: "Lagos" },
  
  // Media & Entertainment
  { name: "Nigerian Television Authority (NTA)", slug: "nta", type: "government", sector: "other", state: "Federal" },
  { name: "Channels Television", slug: "channels-tv", type: "private", sector: "other", state: "Lagos" },
  { name: "MultiChoice Nigeria (DStv/GOtv)", slug: "multichoice", type: "private", sector: "other", state: "Lagos" },
  
  // Aviation
  { name: "Federal Airports Authority of Nigeria (FAAN)", slug: "faan", type: "government", sector: "government", state: "Federal" },
  { name: "Nigerian Civil Aviation Authority (NCAA)", slug: "ncaa", type: "government", sector: "government", state: "Federal" },
  { name: "Air Peace", slug: "air-peace", type: "private", sector: "other", state: "Lagos" },
  { name: "Arik Air", slug: "arik-air", type: "private", sector: "other", state: "Lagos" },
  
  // Retail & FMCG
  { name: "Shoprite Nigeria", slug: "shoprite", type: "private", sector: "other", state: "Lagos" },
  { name: "Spar Nigeria", slug: "spar", type: "private", sector: "other", state: "Lagos" },
  { name: "Game Stores", slug: "game-stores", type: "private", sector: "other", state: "Lagos" },
  
  // Construction & Real Estate
  { name: "Julius Berger Nigeria", slug: "julius-berger", type: "private", sector: "other", state: "FCT" },
  { name: "RCC (Reynolds Construction Company)", slug: "rcc", type: "private", sector: "other", state: "Lagos" },
  
  // Additional State Governments
  { name: "Anambra State Government", slug: "anambra-state-govt", type: "government", sector: "government", state: "Anambra" },
  { name: "Akwa Ibom State Government", slug: "akwa-ibom-state-govt", type: "government", sector: "government", state: "Akwa Ibom" },
  { name: "Cross River State Government", slug: "cross-river-state-govt", type: "government", sector: "government", state: "Cross River" },
  { name: "Bayelsa State Government", slug: "bayelsa-state-govt", type: "government", sector: "government", state: "Bayelsa" },
  { name: "Plateau State Government", slug: "plateau-state-govt", type: "government", sector: "government", state: "Plateau" },
  { name: "Benue State Government", slug: "benue-state-govt", type: "government", sector: "government", state: "Benue" },
  { name: "Kwara State Government", slug: "kwara-state-govt", type: "government", sector: "government", state: "Kwara" },
  { name: "Ondo State Government", slug: "ondo-state-govt", type: "government", sector: "government", state: "Ondo" },
  { name: "Osun State Government", slug: "osun-state-govt", type: "government", sector: "government", state: "Osun" },
  { name: "Ekiti State Government", slug: "ekiti-state-govt", type: "government", sector: "government", state: "Ekiti" },
  
  // More Federal Agencies
  { name: "Nigeria Customs Service", slug: "customs", type: "government", sector: "government", state: "Federal" },
  { name: "National Identity Management Commission (NIMC)", slug: "nimc", type: "government", sector: "government", state: "Federal" },
  { name: "Nigerian Ports Authority (NPA)", slug: "npa", type: "government", sector: "government", state: "Federal" },
  { name: "Securities and Exchange Commission (SEC)", slug: "sec", type: "government", sector: "government", state: "Federal" },
  { name: "National Pension Commission (PENCOM)", slug: "pencom", type: "government", sector: "government", state: "Federal" },
  { name: "National Health Insurance Scheme (NHIS)", slug: "nhis", type: "government", sector: "healthcare", state: "Federal" },
];

export async function seedOrganizations() {
  console.log("Seeding organizations...");
  
  try {
    // Check if organizations already exist
    const existingOrgs = await db.select().from(organizations).limit(1);
    
    if (existingOrgs.length > 0) {
      console.log("Organizations already seeded. Skipping...");
      return;
    }

    // Insert all organizations
    await db.insert(organizations).values(
      nigerianOrganizations.map(org => ({
        ...org,
        isCustom: false,
        isApproved: true,
      }))
    );

    console.log(`Successfully seeded ${nigerianOrganizations.length} organizations!`);
  } catch (error) {
    console.error("Error seeding organizations:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOrganizations()
    .then(() => {
      console.log("Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
