fetch('http://localhost:3001/orders')
  .then((response) => response.json())
  .then((data) => {
    console.log('Orders from API:', data);
  })
  .catch((error) => {
    console.error('Error fetching orders:', error);
  });
