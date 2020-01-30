import { Company } from "./game-state";

export enum AdjustStockAction {
  WITHHOLD = "withhold",
  PAY_DIVIDENDS = "pay dividends",
  ALL_SHARES_HELD = "all shares held",
  SHARES_SOLD = "shares sold",
  START_COMPANY = "start company"
}

const numColumns = [15, 15, 12, 10, 8, 7, 6, 5, 4, 4, 4].reverse();
const stockValues = [
  10,
  20,
  30,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
  75,
  80,
  90,
  100,
  110,
  125,
  140,
  155,
  175,
  200,
  225,
  255,
  285,
  315,
  350,
];

export function getStockValue(company: Company) {
  if (!company.stockPosition) return null;

  return stockValues[company.stockPosition.row + company.stockPosition.col];
}

export function adjustStock(companies: Company[], company: Company, action: AdjustStockAction) {

    if(!company.stockPosition) return;

    if(action == AdjustStockAction.ALL_SHARES_HELD) {
        if(company.stockPosition.row < numColumns.length - 1) company.stockPosition.row++;
    } else if(action == AdjustStockAction.PAY_DIVIDENDS) {
        if(company.stockPosition.col < numColumns[company.stockPosition.row] - 1) company.stockPosition.col++
        else if(company.stockPosition.row < numColumns.length - 1) company.stockPosition.row++;
    } else if(action == AdjustStockAction.SHARES_SOLD) {
        if(company.stockPosition.row > 0 && numColumns[company.stockPosition.row-1] > company.stockPosition.col) company.stockPosition.row--;
    }
    else if(action == AdjustStockAction.WITHHOLD) {
        if(company.stockPosition.col > 0) company.stockPosition.col--;
        else if(company.stockPosition.row > 0) company.stockPosition.row--;
    }

    // check if there is another company in that spot
    let maxZ = 0;
    for(const companyB of companies) {
        if(companyB.id == company.id) continue;
        if(!companyB.stockPosition || companyB.stockPosition.row != company.stockPosition.row || companyB.stockPosition.col != company.stockPosition.col) continue;
        
        maxZ = Math.max(maxZ, companyB.stockPosition.z);
    }

    company.stockPosition.z = maxZ+1;
}
