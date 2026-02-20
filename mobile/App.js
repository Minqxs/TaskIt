import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, SafeAreaView, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [email, setEmail] = useState('customer@hometask.sa');
  const [password, setPassword] = useState('Password123!');
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync('jwt').then((saved) => saved && setToken(saved));
  }, []);

  const login = async () => {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setToken(data.token);
    setUser({ userId: data.userId, role: data.role });
    await SecureStore.setItemAsync('jwt', data.token);
  };

  const loadProviders = async () => {
    const response = await fetch(`${API}/providers`);
    setProviders(await response.json());
  };

  const createBooking = async () => {
    if (!selectedProvider || !user) return;
    await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customerId: user.userId,
        serviceProviderId: selectedProvider,
        date: new Date().toISOString(),
        durationHours: 2,
        description: 'General house cleaning'
      })
    });
    await loadBookings();
  };

  const loadBookings = async () => {
    if (!user) return;
    const response = await fetch(`${API}/bookings/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookings(await response.json());
  };

  if (!token) {
    return (
      <SafeAreaView style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>HomeTask SA</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, padding: 8 }} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
        <Button title="Login" onPress={login} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Dashboard ({user.role})</Text>
      <Button title="Load Providers" onPress={loadProviders} />
      <FlatList
        data={providers}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, padding: 10, marginTop: 8 }}>
            <Text>{item.name}</Text>
            <Text>SAR {item.hourlyRate}/hour</Text>
            <Text>⭐ {item.rating}</Text>
            <Button title="Select" onPress={() => setSelectedProvider(item.userId)} />
          </View>
        )}
      />
      <Button title="Create Booking" onPress={createBooking} />
      <Button title="Load My Bookings" onPress={loadBookings} />
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, padding: 10, marginTop: 8 }}>
            <Text>{item.description}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Payment: {item.paymentStatus}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
