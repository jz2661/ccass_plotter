import requests
from bs4 import BeautifulSoup
import aiohttp
import asyncio


def load_share_holdings(stock_code, date):
    with requests.Session() as s:

        URL = "https://www3.hkexnews.hk/sdw/search/searchsdw.aspx"
        s.headers={"User-Agent":"Mozilla/5.0"}
        res = s.get(URL)

        soup = BeautifulSoup(res.text,"lxml")
        payload = {item['name']:item.get('value','') for item in soup.select("input[name]")}
        payload['__EVENTTARGET'] = 'btnSearch'
        payload['sortDirection'] = 'desc'
        payload['txtStockCode'] = stock_code
        payload['txtShareholdingDate'] = date
        
        req = s.post(URL,data=payload,headers={"User-Agent":"Mozilla/5.0"})
        soup_obj = BeautifulSoup(req.text,"lxml")
        
        r = 1
        holdings = []

        for items in soup_obj.select("table tbody tr"): 
            data = [item.get_text(strip=True) for item in items.select("td")]
            record = {}
            record['date'] = date
            record['rank'] = r
            record['participantId'] = data[0].split(':')[-1]
            record['participantName'] = data[1].split(':')[-1]
            record['address'] = data[2].split(':')[-1]
            record['shareHolding'] = int(data[3].split(':')[-1].replace(',',''))
            record['sharePct'] = float(data[4].split(':')[-1][:-2])
            r += 1
            holdings.append(record)
    
    return holdings

async def load_share_holdings_async(stock_code, date, reslist):
    print(f"Start loading {stock_code} for {date}...")
    async with aiohttp.ClientSession() as s:
        URL = "https://www3.hkexnews.hk/sdw/search/searchsdw.aspx"
        #s.headers={"User-Agent":"Mozilla/5.0"}  
        
        async with s.get(URL) as res:
            data = await res.text()
            soup = BeautifulSoup(data,"lxml")
            payload = {item['name']:item.get('value','') for item in soup.select("input[name]")}
            payload['__EVENTTARGET'] = 'btnSearch'
            payload['sortDirection'] = 'desc'
            payload['txtStockCode'] = stock_code
            payload['txtShareholdingDate'] = date
            
            async with s.post(URL,data=payload,headers={"User-Agent":"Mozilla/5.0"}) as req:
                data = await req.text()
                soup_obj = BeautifulSoup(data,"lxml")
                
                r = 1
                holdings = []

                for items in soup_obj.select("table tbody tr"): 
                    data = [item.get_text(strip=True) for item in items.select("td")]
                    record = {}
                    record['date'] = date
                    record['rank'] = r
                    record['participantId'] = data[0].split(':')[-1]
                    record['participantName'] = data[1].split(':')[-1]
                    record['address'] = data[2].split(':')[-1]
                    record['shareHolding'] = int(data[3].split(':')[-1].replace(',',''))
                    record['sharePct'] = float(data[4].split(':')[-1][:-2])
                    r += 1
                    holdings.append(record)
                
                reslist += holdings
                print(f"Finished loading {stock_code} for {date}.")

                return holdings


async def load_dates_holdings_async(stock_code, dates):
    reslist = []
    await asyncio.gather(*((load_share_holdings_async(stock_code, date, reslist)) for date in dates))
    return reslist
