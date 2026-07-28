📦 Smart Courier Auto-Splitter
An automated logistics optimization utility designed for F-commerce and e-commerce merchants in Bangladesh. This tool calculates real-time shipping rates across multiple local couriers and automatically splits daily orders to minimize total delivery bills.
🚀 The Value Proposition
Time Saved: Reduces nightly manual logistics planning from hours to minutes.
Money Saved: Cuts daily delivery bills by 10-15% through algorithmic zone and weight matching.
Architecture: 100% Serverless / Client-side calculation engine. Zero database required for the core MVP.
🧠 System Architecture
The core flow operates in three simple steps:
📥 Data Drop: Merchant inputs order data (Destination, Weight, COD value).
⚙️ Decision Engine: The app compares the input against the static pricing rules of major couriers (Pathao, CarryBee, RedX).
✂️ Smart Split: The system highlights the absolute cheapest courier for that specific route and weight slab.
📊 Core Business Logic (Pricing Rules)
1. CarryBee
Calculated via specific weight slabs up to 3kg, plus a flat overage fee per extra kg.
Zones: INTRA_CITY, DHAKA_TO_DISTRICT, DISTRICT_TO_DISTRICT
Base (Intra-City): 49 BDT (upto 200g) ... 110 BDT (upto 3kg). Overage: 20 BDT/kg.
2. Pathao
Calculated via weight tiers up to 2kg, plus overage, plus a strict 1% COD penalty.
Zones: Same City, Suburbs, Inter City Dhaka, Intercity Outside Dhaka
Base (Same City): 60 BDT (upto 500g) ... 90 BDT (upto 2kg). Overage: 15 BDT/kg.
COD Charge: 1% of the total product price.
3. RedX
Calculated by a simple 1kg base rate + extra kg overage.
Zones: INSIDE_DHAKA, DHAKA_SUBURB, OUTSIDE_DHAKA
Base (Inside Dhaka): 65 BDT (first 1kg). Overage: 15 BDT/kg.
COD Charge: 0% Inside Dhaka; 1% Suburbs & Outside Dhaka.
🤖 LLM Master Generation Prompt
Copy and paste the prompt below into Cursor, GitHub Copilot, or ChatGPT to instantly generate the Next.js application framework.
Role: Act as a Senior Next.js Full-Stack Engineer and UX Designer.
Task: Build a "Smart Courier Rate Calculator" for Bangladeshi F-commerce.
Tech Stack: Next.js (App Router, TypeScript), Tailwind CSS, Lucide React, Shadcn UI.
Architecture:
Create a utility file (lib/courierCalculators.ts) exporting: calculatePathao, calculateRedX, and calculateCarryBee.
Create a unified Input Form on the client side (app/page.tsx) that accepts standard inputs (Pickup, Delivery, Weight, Price, COD toggle).
Display a "Results Dashboard" sorting couriers from cheapest to most expensive, highlighting the winner.
Logic:
(Refer to the documentation above for specific zone and slab algorithms for Pathao, CarryBee, and RedX).
UI Instructions:
Build a modern dashboard. Include a translation layer mapping generic locations (Inside Dhaka, Suburbs, Outside) to the specific courier terminologies. Highlight the cheapest card with a green border.
Maintained and developed for the Bangladeshi e-commerce ecosystem.

