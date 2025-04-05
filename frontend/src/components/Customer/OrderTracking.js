import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, LoadScript } from '@react-google-maps/api';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';

const OrderTracking = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  useEffect(() => {
    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading order details');
        setLoading(false);
      }
    };

    fetchOrder();

    // Listen for real-time rider location updates
    if (socket) {
      socket.emit('join-order-tracking', { orderId: id });
      
      socket.on('rider-location-update', (data) => {
        if (data.orderId === id) {
          setRiderLocation(data.location);
        }
      });

      socket.on('order-status-update', (data) => {
        if (data.orderId === id) {
          setOrder(prevOrder => ({
            ...prevOrder,
            status: data.status
          }));
        }
      });
    }

    return () => {
      // Clean up socket listeners
      if (socket) {
        socket.off('rider-location-update');
        socket.off('order-status-update');
        socket.emit('leave-order-tracking', { orderId: id });
      }
    };
  }, [id]);

  // Calculate and display directions when rider location is available
  useEffect(() => {
    if (!order || !riderLocation || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: riderLocation.lat, lng: riderLocation.lng },
        destination: { 
          lat: order.deliveryAddress.coordinates.lat, 
          lng: order.deliveryAddress.coordinates.lng 
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  }, [order, riderLocation]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="not-found">Order not found</div>;

  return (
    <div className="order-tracking">
      <h2>Track Your Order</h2>
      
      <div className="order-info">
        <div className="status">
          <h3>Order Status: <span className={`status-${order.status}`}>{order.status}</span></h3>
          <div className="status-timeline">
            <div className={`status-step ${order.status === 'placed' || order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready-for-pickup' || order.status === 'out-for-delivery' || order.status === 'delivered' ? 'active' : ''}`}>
              Placed
            </div>
            <div className={`status-step ${order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready-for-pickup' || order.status === 'out-for-delivery' || order.status === 'delivered' ? 'active' : ''}`}>
              Confirmed
            </div>
            <div className={`status-step ${order.status === 'preparing' || order.status === 'ready-for-pickup' || order.status === 'out-for-delivery' || order.status === 'delivered' ? 'active' : ''}`}>
              Preparing
            </div>
            <div className={`status-step ${order.status === 'ready-for-pickup' || order.status === 'out-for-delivery' || order.status === 'delivered' ? 'active' : ''}`}>
              Ready
            </div>
            <div className={`status-step ${order.status === 'out-for-delivery' || order.status === 'delivered' ? 'active' : ''}`}>
              Out for delivery
            </div>
            <div className={`status-step ${order.status === 'delivered' ? 'active' : ''}`}>
              Delivered
            </div>
          </div>
        </div>

        <div className="estimated-time">
          <h4>Estimated Delivery Time:</h4>
          <p>{new Date(order.estimatedDeliveryTime).toLocaleTimeString()}</p>
        </div>
      </div>

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={riderLocation || (order.restaurant.address.coordinates)}
          zoom={13}
        >
          {/* Restaurant Marker */}
          <Marker
            position={order.restaurant.address.coordinates}
            label="R"
            title={order.restaurant.name}
          />
          
          {/* Delivery Address Marker */}
          <Marker
            position={order.deliveryAddress.coordinates}
            label="D"
            title="Delivery Address"
          />
          
          {/* Rider Marker */}
          {riderLocation && (
            <Marker
              position={riderLocation}
              icon={{
                url: '/assets/rider-icon.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
              title="Delivery Rider"
            />
          )}
          
          {/* Show directions if available */}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>

      <div className="order-details">
        <h3>Order Details</h3>
        <div className="restaurant-name">
          <p><strong>Restaurant:</strong> {order.restaurant.name}</p>
        </div>
        
        <h4>Items:</h4>
        <ul className="order-items">
          {order.items.map((item, index) => (
            <li key={index}>
              <span>{item.quantity}x {item.menuItem.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        
        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee:</span>
            <span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="payment-method">
            <span>Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
