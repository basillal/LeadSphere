import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import leadCategoryService from '../services/leadCategoryService';
import serviceService from '../services/serviceService';
import { useAuth } from '../components/auth/AuthProvider';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { selectedOrganization, isAuthenticated } = useAuth();
    
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    
    const [services, setServices] = useState([]);
    const [servicesLoading, setServicesLoading] = useState(false);

    // Using refs to prevent duplicate concurrent requests
    const fetchPromises = useRef(new Map());

    const fetchCategories = useCallback(async (force = false) => {
        if (!isAuthenticated) return;
        
        // If already loading and not forced, wait for existing promise
        if (fetchPromises.current.has('categories') && !force) {
            return fetchPromises.current.get('categories');
        }

        // If already have data and not forced, skip
        if (categories.length > 0 && !force) return;

        const promise = (async () => {
            setCategoriesLoading(true);
            try {
                const res = await leadCategoryService.getCategories();
                const data = res.data || [];
                setCategories(data);
                return data;
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                return [];
            } finally {
                setCategoriesLoading(false);
                fetchPromises.current.delete('categories');
            }
        })();

        fetchPromises.current.set('categories', promise);
        return promise;
    }, [isAuthenticated, categories.length]);

    const fetchServices = useCallback(async (force = false) => {
        if (!isAuthenticated) return;

        if (fetchPromises.current.has('services') && !force) {
            return fetchPromises.current.get('services');
        }

        if (services.length > 0 && !force) return;

        const promise = (async () => {
            setServicesLoading(true);
            try {
                const res = await serviceService.getServices({ isActive: true });
                const data = res.data || [];
                setServices(data);
                return data;
            } catch (error) {
                console.error('Failed to fetch services:', error);
                return [];
            } finally {
                setServicesLoading(false);
                fetchPromises.current.delete('services');
            }
        })();

        fetchPromises.current.set('services', promise);
        return promise;
    }, [isAuthenticated, services.length]);

    // Fetch initial data when authenticated or organization changes
    useEffect(() => {
        if (isAuthenticated) {
            // Force fetch on organization change or initial login
            fetchCategories(true);
            fetchServices(true);
        } else {
            setCategories([]);
            setServices([]);
        }
    }, [isAuthenticated, selectedOrganization, fetchCategories, fetchServices]);

    const refreshCategories = () => fetchCategories(true);
    const refreshServices = () => fetchServices(true);

    const value = useMemo(() => ({
        categories,
        categoriesLoading,
        refreshCategories,
        services,
        servicesLoading,
        refreshServices,
    }), [categories, categoriesLoading, services, servicesLoading]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
