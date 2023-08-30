import {
  Card,
  Metric,
  Text,
  List,
  ListItem,
  BadgeDelta,
  Flex,
  Bold,
  DeltaType,
  Grid,
} from "@tremor/react";

export default function Example({ source, csData }) {
  const combinedData = source.map((item1) => {
    const matchingItem = csData.find((item2) => item2.data.csId === item1.data.csId);
    const mergedData = { ...item1.data, ...matchingItem };
    return { data : mergedData };
  });

  const province = combinedData
    .map(item => {
      const provinsi = item.data.data.location.split(", ").slice(-2)[0];
      item.data.provinsi = provinsi;
      return { item: item.data };
    });
  console.log("province", province)

  const totalValue = (year, month, day, criteria) => {
    if (criteria == "totalPrice") {
      const totalPrice = newData
        .filter(item => {
          const itemDate = new Date(item.data.orderDate);
          const startDate = new Date(year, month, 1);
          return itemDate >= startDate && itemDate <= new Date(year, month, day);
        })
        .reduce((total, item) => total + item.data.totalPrice, 0);
      return totalPrice;
    } else if (criteria == "duration") {
      const totalDuration = newData
        .filter(item => {
          const itemDate = new Date(item.data.orderDate);
          const startDate = new Date(year, month, 1);
          return itemDate >= startDate && itemDate <= new Date(year, month, day);
        })
        .reduce((total, item) => total + item.data.duration, 0);
      return totalDuration;
    } else {
      const totalCustomer = newData
        .filter(item => {
          const itemDate = new Date(item.data.orderDate);
          const startDate = new Date(year, month, 1);
          return itemDate >= startDate && itemDate <= new Date(year, month, day);
        })
        .reduce((total, item) => total + item.customer, 0);
      return totalCustomer;
    }
  };

  const comparison = (currentYear, currentMonth, currentDay, criteria) => {
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const daysInPreviousMonth = new Date(previousYear, previousMonth, 1).getDate();

    if (criteria == "totalPrice") {
      const currentMonthTotal = totalValue(currentYear, currentMonth, currentDay, "totalPrice");
      const previousMonthTotal = totalValue(previousYear, previousMonth, currentDay, "totalPrice");
      return { currentMonthTotal, previousMonthTotal };
    } else if (criteria == "duration") {
      const currentMonthDuration = totalValue(currentYear, currentMonth, currentDay, "duration");
      const previousMonthDuration = totalValue(previousYear, previousMonth, currentDay, "duration");
      return { currentMonthDuration, previousMonthDuration };
    } else {
      const currentMonthCustomer = totalValue(currentYear, currentMonth, currentDay, "totalCustomer");
      const previousMonthCustomer = totalValue(previousYear, previousMonth, currentDay, "totalCustomer");
      return { currentMonthCustomer, previousMonthCustomer };
    }
  };

  const addColumn = data => {
    return data.map(user => ({ ...user, customer: 1 }));
  };


  const newData = addColumn(source)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate() + 1;
  const dataFinal = addColumn(province)
  console.log("data final", dataFinal)

  const previousProvince = dataFinal
  .filter(item => {
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const itemDate = new Date(item.item.orderDate);
    return itemDate >= startDate && itemDate <= new Date(currentYear, currentMonth - 1, currentDay);
  })
  console.log("previous province", previousProvince)

  const currentProvince = dataFinal
    .filter(item => {
      const startDate = new Date(currentYear, currentMonth, 1);
      const itemDate = new Date(item.item.orderDate);
      return itemDate >= startDate && itemDate <= new Date(currentYear, currentMonth, currentDay);
    })
  console.log("current province", currentProvince)

    interface Item {
      provinsi: string;
      totalPrice: number;
      totalDuration: number;
      totalCustomer: number;
    }
    const groupAndSumData = (data: Item[]) => {
      return data.reduce((acc: Item[], item: Item) => {
        const provinsi = item.item.provinsi;
        const totalPrice = item.item.totalPrice
        const totalDuration = item.item.duration
        const totalCustomer = item.customer
        const existingprovinsi = acc.findIndex((accItem: Item) => accItem.provinsi === provinsi);
        if (existingprovinsi !== -1) {
          acc[existingprovinsi].totalPrice += totalPrice;
          acc[existingprovinsi].totalDuration += totalDuration;
          acc[existingprovinsi].totalCustomer += totalCustomer;
        } else {
          acc.push({ provinsi, totalPrice, totalDuration, totalCustomer });
        }
  
        return acc;
      }, []);
    };
  const totalData = groupAndSumData(dataFinal)
  console.log("total data", totalData)
  const sortedData = [...totalData].sort((a, b) => b.totalPrice - a.totalPrice);
  const provinsiList = sortedData.map(item => item.provinsi);
  console.log("sorted", provinsiList)

  const { currentMonthTotal, previousMonthTotal } = comparison(currentYear, currentMonth, currentDay, "totalPrice");
  const { currentMonthDuration, previousMonthDuration } = comparison(currentYear, currentMonth, currentDay, "duration")
  const { currentMonthCustomer, previousMonthCustomer } = comparison(currentYear, currentMonth, currentDay, "customer")

  const provinceComparison = (selectedProvince, selectedValue) => {
    const thisMonth = groupAndSumData(currentProvince)
    console.log("this month", thisMonth)
    const prevMonth = groupAndSumData(previousProvince)
    console.log("prev month", prevMonth)
    const currentTarget = thisMonth.find(item => item.provinsi === selectedProvince)
    const prevTarget = prevMonth.find(item => item.provinsi === selectedProvince)
    if (selectedValue == "totalPrice"){
      const currentValue = currentTarget ? currentTarget.totalPrice : 0;
      const prevValue = prevTarget ? prevTarget.totalPrice : 0;
      const percentage = (((currentValue - prevValue) / prevValue) * 100).toFixed(2);
      return `${percentage}%`
    } else if (selectedValue == "totalDuration"){
      const currentValue = currentTarget ? currentTarget.totalDuration : 0;
      const prevValue = prevTarget ? prevTarget.totalDuration : 0;
      const percentage = (((currentValue - prevValue) / prevValue) * 100).toFixed(2);
      return `${percentage}%`
    } else if (selectedValue == "totalCustomer"){
      const currentValue = currentTarget ? currentTarget.totalCustomer : 0;
      const prevValue = prevTarget ? prevTarget.totalCustomer : 0;
      const percentage = (((currentValue - prevValue) / prevValue) * 100).toFixed(2);
      return `${percentage}%`
    }
  }
  console.log("percentage", provinceComparison(provinsiList[0], "totalDuration"))
  console.log("percentage", provinceComparison(provinsiList[1], "totalDuration"))
  console.log("percentage", provinceComparison(provinsiList[2], "totalDuration"))
  console.log("percentage", provinceComparison(provinsiList[3], "totalDuration"))

  const sales = [
    {
      name: provinsiList[0],
      stat: provinceComparison(provinsiList[0], "totalPrice"),
      status: "increase",
    },
    {
      name: provinsiList[1],
      stat: provinceComparison(provinsiList[1], "totalPrice"),
      status: "moderateIncrease",
    },
    {
      name: provinsiList[2],
      stat: provinceComparison(provinsiList[2], "totalPrice"),
      status: "unchanged",
    },
    {
      name: provinsiList[3],
      stat: provinceComparison(provinsiList[3], "totalPrice"),
      status: "moderateDecrease",
    },
  ];

  const profit = [
    {
      name: provinsiList[0],
      stat: provinceComparison(provinsiList[0], "totalPrice"),
      status: "unchanged",
    },
    {
      name: provinsiList[1],
      stat: provinceComparison(provinsiList[1], "totalPrice"),
      status: "moderateIncrease",
    },
    {
      name: provinsiList[2],
      stat: provinceComparison(provinsiList[2], "totalPrice"),
      status: "moderateIncrease",
    },
    {
      name: provinsiList[3],
      stat: provinceComparison(provinsiList[3], "totalPrice"),
      status: "decrease",
    },
  ];

  const customers = [
    {
      name: provinsiList[0],
      stat: provinceComparison(provinsiList[0], "totalCustomer"),
      status: "moderateDecrease",
    },
    {
      name: provinsiList[1],
      stat: provinceComparison(provinsiList[1], "totalCustomer"),
      status: "increase",
    },
    {
      name: provinsiList[2],
      stat: provinceComparison(provinsiList[2], "totalCustomer"),
      status: "moderateIncrease",
    },
    {
      name: provinsiList[3],
      stat: provinceComparison(provinsiList[3], "totalCustomer"),
      status: "unchanged",
    },
  ];

  const duration = [
    {
      name: provinsiList[0],
      stat: provinceComparison(provinsiList[0], "totalDuration"),
      status: "moderateDecrease",
    },
    {
      name: provinsiList[1],
      stat: provinceComparison(provinsiList[1], "totalDuration"),
      status: "increase",
    },
    {
      name: provinsiList[2],
      stat: provinceComparison(provinsiList[2], "totalDuration"),
      status: "moderateIncrease",
    },
    {
      name: provinsiList[3],
      stat: provinceComparison(provinsiList[3], "totalDuration"),
      status: "unchanged",
    },
  ];

  const categories = [
    {
      title: "Sales",
      metric: currentMonthTotal,
      metricPrev: previousMonthTotal,
      delta: "0",
      data: sales,
      deltaType: "moderateIncrease",
    },
    {
      title: "Profit",
      metric: currentMonthTotal * (5 / 100),
      metricPrev: previousMonthTotal * (5 / 100),
      delta: "0",
      data: profit,
      deltaType: "moderateIncrease",
    },
    {
      title: "Customers",
      metric: currentMonthCustomer,
      metricPrev: previousMonthCustomer,
      delta: "0",
      data: customers,
      deltaType: "moderateIncrease",
    },
    {
      title: "Duration",
      metric: currentMonthDuration,
      metricPrev: previousMonthDuration,
      delta: "0",
      data: duration,
      deltaType: "moderateDecrease",
    },
  ];

  categories.forEach(category => {
    const percentageChange = ((category.metric - category.metricPrev) / category.metricPrev) * 100;

    if (percentageChange > 0) {
      category.delta = `+${percentageChange.toFixed(2)}%`;
      category.deltaType = "moderateIncrease";
    } else if (percentageChange < 0) {
      category.delta = `${percentageChange.toFixed(2)}%`;
      category.deltaType = "moderateDecrease";
    } else {
      category.delta = "0.00%";
      category.deltaType = "unchanged";
    }
  });
  return (
    <Grid numItemsSm={3} numItemsLg={4} numItemsMd={2} className="gap-6">
      {categories.map((item) => (
        <Card key={item.title} style={{ width: "335px", height: "310px" }}>
          <Flex alignItems="start">
            <Text>{item.title}</Text>
            <BadgeDelta deltaType={item.deltaType}>{item.delta}</BadgeDelta>
          </Flex>
          <Flex justifyContent="start" alignItems="baseline" className="truncate space-x-3">
            <Metric>{item.metric}</Metric>
            <Text className="truncate">from {item.metricPrev}</Text>
          </Flex>
          <Flex className="mt-6">
            <Text>
              <Bold>Province</Bold>
            </Text>
            <Text>
              <Bold>WoW (%)</Bold>
            </Text>
          </Flex>
          <List className="mt-1">
            {item.data.map((country) => (
              <ListItem key={country.name}>
                <Flex justifyContent="start" className="truncate space-x-2.5">
                  <BadgeDelta deltaType={country.status as DeltaType} />
                  <Text className="truncate">{country.name}</Text>
                </Flex>
                <Text>{country.stat}</Text>
              </ListItem>
            ))}
          </List>
        </Card>
      ))}
    </Grid>
  );
};