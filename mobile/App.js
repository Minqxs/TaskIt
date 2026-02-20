import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, SafeAreaView, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('Customer');
  const [email, setEmail] = useState('customer@hometask.sa');
  const [password, setPassword] = useState('Password123!');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync('jwt').then((saved) => saved && setToken(saved));
  }, []);

  const saveAuth = async (data) => {
    setToken(data.token);
    setUser({ userId: data.userId, role: data.role });
    await SecureStore.setItemAsync('jwt', data.token);
  };

  const login = async () => {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    await saveAuth(await response.json());
  };

  const register = async () => {
    const response = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        role,
        fullName,
        phoneNumber,
        governmentIdNumber: role === 'ServiceProvider' ? governmentIdNumber : null,
        city: role === 'ServiceProvider' ? city : null,
        district: role === 'ServiceProvider' ? district : null,
        addressLine: role === 'ServiceProvider' ? addressLine : null
      })
    });
    await saveAuth(await response.json());
  };

  const oauthLogin = async () => {
    const response = await fetch(`${API}/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'Google',
        oAuthSubject: `mock-${email}`,
        email,
        role,
        fullName: fullName || email
      })
    });
    await saveAuth(await response.json());
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
      <SafeAreaView style={{ padding: 24, gap: 10 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>HomeTask SA</Text>
        <Text>{isRegister ? 'Create Account' : 'Login'}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Customer" onPress={() => setRole('Customer')} />
          <Button title="Service Provider" onPress={() => setRole('ServiceProvider')} />
        </View>
        <Text>Selected role: {role}</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, padding: 8 }} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
        {isRegister && (
          <>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Full Name" style={{ borderWidth: 1, padding: 8 }} />
            <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone Number" style={{ borderWidth: 1, padding: 8 }} />
            {role === 'ServiceProvider' && (
              <>
                <TextInput value={governmentIdNumber} onChangeText={setGovernmentIdNumber} placeholder="Government ID Number" style={{ borderWidth: 1, padding: 8 }} />
                <TextInput value={city} onChangeText={setCity} placeholder="City" style={{ borderWidth: 1, padding: 8 }} />
                <TextInput value={district} onChangeText={setDistrict} placeholder="District" style={{ borderWidth: 1, padding: 8 }} />
                <TextInput value={addressLine} onChangeText={setAddressLine} placeholder="Address Line" style={{ borderWidth: 1, padding: 8 }} />
                <Text>Provider verification status starts as unverified.</Text>
              </>
            )}
          </>
        )}
        {isRegister ? <Button title="Register" onPress={register} /> : <Button title="Login" onPress={login} />}
        <Button title="Continue with Google (Mock OAuth)" onPress={oauthLogin} />
        <Button title={isRegister ? 'Have account? Go to Login' : 'New user? Register'} onPress={() => setIsRegister(!isRegister)} />
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
            <Text>{item.city} - {item.district}</Text>
            <Text>{item.isVerified ? 'Verified' : 'Not verified'}</Text>
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
