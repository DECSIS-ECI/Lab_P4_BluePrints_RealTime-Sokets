import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useBlueprint(author, name) {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);

  const loadBlueprint = useCallback(async () => {
    if (!author || !name) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBlueprint(author, name);
      setBlueprint(data);
      setTotalPoints(data.points?.length || 0);
    } catch (err) {
      setError(err.message);
      // Si no existe, crear uno vacío
      setBlueprint({ author, name, points: [] });
      setTotalPoints(0);
    } finally {
      setLoading(false);
    }
  }, [author, name]);

  const addPoint = useCallback((point) => {
    setBlueprint(prev => {
      if (!prev) return { author, name, points: [point] };
      const newPoints = [...prev.points, point];
      setTotalPoints(newPoints.length);
      return { ...prev, points: newPoints };
    });
  }, [author, name]);

  const updateBlueprint = useCallback(async (updatedData) => {
    try {
      const result = await api.updateBlueprint(author, name, updatedData);
      setBlueprint(result);
      setTotalPoints(result.points?.length || 0);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [author, name]);

  const deleteBlueprint = useCallback(async () => {
    try {
      await api.deleteBlueprint(author, name);
      setBlueprint(null);
      setTotalPoints(0);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [author, name]);

  const createBlueprint = useCallback(async (newBlueprint) => {
    try {
      const result = await api.createBlueprint(newBlueprint);
      setBlueprint(result);
      setTotalPoints(result.points?.length || 0);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadBlueprint();
  }, [loadBlueprint]);

  return {
    blueprint,
    loading,
    error,
    totalPoints,
    loadBlueprint,
    addPoint,
    updateBlueprint,
    deleteBlueprint,
    createBlueprint,
  };
}