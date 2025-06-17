import { useState, useCallback, useEffect } from 'react';

export type Route = 
  | 'search' 
  | 'compare' 
  | 'lists' 
  | 'deals' 
  | 'profile'
  | 'profile/settings'
  | 'profile/security' 
  | 'profile/preferences'
  | 'profile/support'
  | 'login'
  | 'signup';

interface RouterState {
  currentRoute: Route;
  previousRoute: Route | null;
  params: Record<string, string>;
}

export const useRouter = () => {
  const [routerState, setRouterState] = useState<RouterState>(() => {
    // Initialize from URL hash or default to search
    const hash = window.location.hash.slice(1) || 'search';
    return {
      currentRoute: hash as Route,
      previousRoute: null,
      params: {}
    };
  });

  // Update URL when route changes
  useEffect(() => {
    window.location.hash = routerState.currentRoute;
  }, [routerState.currentRoute]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'search';
      setRouterState(prev => ({
        currentRoute: hash as Route,
        previousRoute: prev.currentRoute,
        params: {}
      }));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((route: Route, params?: Record<string, string>) => {
    setRouterState(prev => ({
      currentRoute: route,
      previousRoute: prev.currentRoute,
      params: params || {}
    }));
  }, []);

  const goBack = useCallback(() => {
    if (routerState.previousRoute) {
      navigate(routerState.previousRoute);
    } else {
      navigate('search');
    }
  }, [routerState.previousRoute, navigate]);

  const isActive = useCallback((route: Route) => {
    return routerState.currentRoute === route;
  }, [routerState.currentRoute]);

  const isProfileRoute = useCallback(() => {
    return routerState.currentRoute.startsWith('profile');
  }, [routerState.currentRoute]);

  return {
    currentRoute: routerState.currentRoute,
    previousRoute: routerState.previousRoute,
    params: routerState.params,
    navigate,
    goBack,
    isActive,
    isProfileRoute
  };
};