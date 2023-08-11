import { Bar } from "react-chartjs-2"
import {Chart as ChartJS} from 'chart.js/auto'
import 'chartjs-adapter-date-fns';
import { Card, Title, BarChart, Subtitle } from "@tremor/react";
import {useState} from 'react';

export default function senBarChart({source}) {

    const today = new Date(Date.now() - 12 * 24 * 60 * 60 * 1000);
    // console.log(today)

    function groupAndSumData(data, groupBy, selectedDate = new Date()) {
        
        
        return data.reduce((acc, item) => {
          const stationId = item.data.csId;
          const x = new Date(item.data.orderDate)
          const y = item.data.totalPrice;
          let key;
      
          switch (groupBy) {
            case "week":
                const lastDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
                const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);

                // console.log(firstDayOfWeek)
                if (x < firstDayOfWeek || x > lastDayOfWeek) {
                    console.log('kurang')
                    return acc;
                }
                key = firstDayOfWeek.setHours(0, 0, 0, 0);
                break;
            case "day":
                if (x.setHours(0, 0, 0, 0) !== today.setHours(0, 0, 0, 0)) {
                 
                    return acc;
                }
                key = new Date(x).setHours(0, 0, 0, 0);
                break;
            case "month":
                const firstDayOfMonth = new Date(x.getFullYear(), x.getMonth(), 1);
                const lastDayOfMonth = new Date(x.getFullYear(), x.getMonth() + 1, 0);
                // console.log(firstDayOfMonth)
                // console.log(lastDayOfMonth)
                if (x < firstDayOfMonth || x > lastDayOfMonth) {
                    return acc;
                }
                key = firstDayOfMonth.setHours(0, 0, 0, 0);
                break;
            default:
                console.log("Invalid groupBy value. Please choose 'week', 'day', or 'month'.");
                return acc; 
          }
      
          const existingEntryIndex = acc.findIndex((item) => item.stationId === stationId && item.x === key);
          if (existingEntryIndex !== -1) {
            acc[existingEntryIndex].y += y;
          } else {
            acc.push({ stationId, x: key, y });
          }
      
          return acc;
        }, []);
      }
    
    const [formData, setFormData] = useState(
        {
          aspect: "revenue",
          period: "month"
        }
      )
      
    function handleChange(event) {
          const {name, value} = event.target
          setFormData(prevFormData => {
              return {
                  ...prevFormData,
                  [name]: value
              }
          })
      }
      

    const datas = groupAndSumData(source, formData.period)
    
    datas.sort((a, b) => b.y - a.y);

    const labels = datas.map((item) => item.stationId);
    const dataPoints = datas.map((item) => item.y);
      
    const chartData = {
        labels: labels,
        datasets: [
          {
            label: formData.aspect,
            data: dataPoints,
            borderColor: 'rgb(30 58 138)',
            borderWidth: 1,
          },
        ],
      };

    const chartOptions = {
        scales: {
          x: {
            type: 'category',
          },
        },
        plugins: {
          legend: {
            display: false,
          }
        }
      };

    const dataFormatter = (number: number) => {
      return Intl.NumberFormat("us").format(number).toString();
    };

    const MyBarChart = () => (
        <Card>
          <Title>Top Sales Charging Station</Title>
          <select
            className = "text-sm outline-none"
            id="aspect" 
            value={formData.aspect}
            onChange={handleChange}
            name="aspect"
          >
            <option value="revenue">Revenue</option>
            <option value="duration">Duration</option>
          </select>
          <Subtitle>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          </Subtitle>
          <BarChart
            className="mt-6"
            data={chartData}
            index="name"
            categories={["Total Sales"]}
            colors={["cyan"]}
            valueFormatter={dataFormatter}
            yAxisWidth={48}
          />
        </Card>
    );
    
    return (
      <div>
      <MyBarChart/>
      </div>
    );
};

