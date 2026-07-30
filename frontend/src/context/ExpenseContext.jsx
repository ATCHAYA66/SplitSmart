import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [userExpenses, setUserExpenses] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user) return;
    setLoadingGroups(true);
    try {
      const res = await api.get('/groups');
      if (res.success) {
        setGroups(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  }, [user]);

  const fetchUserExpenses = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/expenses/user');
      if (res.success) {
        setUserExpenses(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user expenses:", err);
    }
  }, [user]);

  const createGroup = async (groupData) => {
    const res = await api.post('/groups', groupData);
    if (res.success) {
      await fetchGroups();
      return res.data;
    }
    throw new Error(res.message || 'Failed to create group');
  };

  const joinGroup = async (joinCode) => {
    const res = await api.post('/groups/join', { joinCode });
    if (res.success) {
      await fetchGroups();
      return res.data;
    }
    throw new Error(res.message || 'Failed to join group');
  };

  return (
    <ExpenseContext.Provider value={{
      groups,
      userExpenses,
      loadingGroups,
      fetchGroups,
      fetchUserExpenses,
      createGroup,
      joinGroup
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
