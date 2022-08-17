from flask import Flask
from datetime import datetime, date, timedelta
import asyncio
import pandas as pd
from data_loader import load_share_holdings, load_dates_holdings_async

app = Flask(__name__)

# CCASS API Routes
@app.route('/')
def test():
    return 'This is CCASS Plotter backend service.'

@app.route('/get_top_10_participants/<stock_code>/<date_str>')
def get_top_10_participants(stock_code, date_str):
    print(f'Get top 10 participants for {stock_code} on {date_str}')

    date_str = date_str[0:4] + '/' + date_str[4:6] + '/' + date_str[6:8]
    holdings = load_share_holdings(stock_code, date_str)

    if len(holdings) >= 10:
        return { 'data': holdings[:10] }
    else:
        return { 'data': holdings }

@app.route('/get_threshold_breakers/<stock_code>/<start_date>/<end_date>/<float:threshold>')
def get_threshold_breakers(stock_code, start_date, end_date, threshold=1.):
    print(f'Get threshold ({threshold}%) breakers for {stock_code} from {start_date} to {end_date}')

    # Get all weekdays within the date range including both start and end dates
    # No holding changes on weekends
    dates = get_all_dates_between(start_date, end_date)

    # Get all daily holdings with async query
    daily_data = asyncio.run(load_dates_holdings_async(stock_code, dates))

    df = pd.DataFrame(daily_data)

    dfm = df.pivot_table(index='date', columns=['participantId'], values='sharePct')

    # Find rows where DoD % change > threshold
    alertdf = abs(dfm.diff()) > threshold
    alerts = alertdf[alertdf > 0].stack().index.tolist()

    # Add rows from previous day of breaks
    prevday_alerts = []
    for alert in alerts:
        alert_date = date(int(alert[0][0:4]), int(alert[0][5:7]), int(alert[0][8:10]))
        prev_date = alert_date - timedelta(days=[3, 1, 1, 1, 1, 1, 2][alert_date.weekday()])
        prevday_alerts.append((str(prev_date).replace('-', '/'), alert[1]))

    dfmulti = df.set_index(['date','participantId'])
    alertdf2 = dfmulti.loc[prevday_alerts + alerts]

    return { 'data': alertdf2.reset_index().to_dict(orient='records') }

def get_all_dates_between(start_date, end_date):
    start = date(int(start_date[0:4]), int(start_date[4:6]), int(start_date[6:8])) 
    end = date(int(end_date[0:4]), int(end_date[4:6]), int(end_date[6:8]))

    delta = end - start
    dates = []

    for i in range(delta.days + 1):
        day = start + timedelta(days=i)
        if day.weekday() <= 4:
            dates.append(str(day).replace('-', '/'))
    
    return dates

if __name__ == '__main__':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    app.run(debug=True)
