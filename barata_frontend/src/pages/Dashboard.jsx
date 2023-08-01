import Chart from "/src/components/chart/Chart";
import Widget from "/src/components/widget/Widget";
import Table from "/src/components/table/Table";
import { getDatabase, ref, onValue} from 'firebase/database'
import { app } from "/src/firebase"
import React from 'react'
import { NotificationContext } from '/src/context/NotificationContext';

const db = getDatabase(app)

export default class Dashboard extends React.Component {

  constructor() {
    super();
    this.state = {
      bookData: [],
      charginstationData: [],
      userData: [],
      loading: true,
      notificationMessages: [],
    };
  }

  componentDidMount() {
    const bookDataPromise = this.fetchDataFromTable('book');
    const chargingstationDataPromise = this.fetchDataFromTable('charging_station');
    const userDataPromise = this.fetchDataFromTable('users');

    Promise.all([bookDataPromise, chargingstationDataPromise,  userDataPromise, Promise])
      .then((results) => {
        const [bookData, chargingstationData, userData ] = results; // add if there's new data
        this.setState({
          bookData,
          chargingstationData,
          userData,
          loading: false,
        });
      })
      .catch((error) => {
        // Handle error if any of the data fetch fails
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.chargingstationData !== this.state.chargingstationData) {
      this.checkInactive();
    }
  }

  fetchDataFromTable(tableName) {
    const dbRef = ref(db, tableName);

    return new Promise((resolve, reject) => {
      onValue(dbRef, (snapshot) => {
        let records = [];
        snapshot.forEach((childSnapshot) => {
          let keyName = childSnapshot.key;
          let data = childSnapshot.val();
          records.push({ key: keyName, data: data });
        });
        resolve(records);
      }, reject);
    });
  }

  checkInactive() {
    const { chargingstationData } = this.state; //{kalo butuh banyak bisa { mau apa, chargingstationData}}
    if (!chargingstationData) {
      return;
    }
    const messages = [];
  
    chargingstationData.forEach((item) => {
      if (item.data && item.data.status === 'tidak aktif') {
        messages.push(`Charging station ${item.key} is not active`);
      }
    });
  
    // this.setState({ notificationMessages: messages });
    this.context.updateNotif(messages);
  }

  render() {
    const { bookData, chargingstationData, userData, loading } = this.state;

    if (loading) {
      return <p className = "px-2">Loading...</p>;
    }

    const active_user_data = [
      { key: 'customerId', label: 'Customer ID' },
      { key: 'csId', label: 'Station ID' },
      { key: 'orderDate', label: 'Order Date' },
    ];

    // const notif = this.state.notificationMessages;

    return (
      <>
        <div className="flex gap-5 mx-2">
          <Widget type="customer" source = {userData}/>
          <Widget type="station" source = {chargingstationData}/>
          <Widget type="transaction" source = {bookData}/>
          <Widget type="bug" source = {bookData}/>
        </div>

        <div className="flex gap-5 mx-2">
          <Table 
            source = {bookData} 
            columns = {active_user_data} 
            title = {'Last active user'} 
            shuffle = {true}
            filter = {5}
          />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>

        <div className="flex gap-5 mx-2">
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
      </>
    )
  }
}

Dashboard.contextType = NotificationContext;
