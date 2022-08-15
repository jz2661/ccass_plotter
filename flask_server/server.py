from flask import Flask
from datetime import datetime
from data_loader import load_share_holdings

app = Flask(__name__)

# CCASS API Routes
@app.route('/test')
def test():
    return 'Hello World!'

@app.route('/get_top_10_participants/<stock_code>/<date_str>')
def get_top_10_participants(stock_code, date_str):
    print(stock_code)
    date_str = date_str[0:4] + '/' + date_str[4:6] + '/' + date_str[6:8]
    print(date_str)
    holdings = load_share_holdings(stock_code, date_str)
    if len(holdings) >= 10:
        return { 'data': holdings[:10] }
    else:
        return { 'data': holdings }

if __name__ == '__main__':
    app.run(debug=True)
