// src/components/PerformanceOptimizer.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Cpu, MemoryStick, Gauge, Battery, Timer, Shield, Rocket } from 'lucide-react';

interface PerformanceOptimizerProps {
  theme: 'light' | 'dark';
  jsonSize: number;
  onOptimizeChange: (optimized: boolean) => void;
  currentLines?: number;
  processingTime?: number;
  memoryUsage?: number;
}

interface PerformanceMetric {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
  recommendation: string;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  theme,
  jsonSize,
  onOptimizeChange,
  currentLines = 0,
  processingTime = 0,
  memoryUsage = 0
}) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric>({
    score: 0,
    level: 'excellent',
    message: '',
    recommendation: ''
  });

  // Calculate performance metrics
  const calculateMetrics = useCallback(() => {
    const sizeMB = jsonSize / 1024 / 1024;
    const lines = currentLines || Math.ceil(jsonSize / 50); // Approximate lines
    
    let score = 100;
    let level: PerformanceMetric['level'] = 'excellent';
    let message = '';
    let recommendation = '';

    // Size-based scoring
    if (sizeMB > 100) {
      score -= 60;
      level = 'poor';
      message = 'Very Large File';
      recommendation = 'Use streaming processing and virtualized rendering';
    } else if (sizeMB > 50) {
      score -= 40;
      level = 'fair';
      message = 'Large File';
      recommendation = 'Enable Ultra-Fast mode for best performance';
    } else if (sizeMB > 10) {
      score -= 20;
      level = 'good';
      message = 'Medium File';
      recommendation = 'Consider Ultra-Fast mode for better experience';
    } else {
      message = 'Small File';
      recommendation = 'Standard processing is sufficient';
    }

    // Lines-based adjustment
    if (lines > 500000) {
      score -= 30;
      level = 'poor';
      message = 'Massive Document';
      recommendation = 'Ultra-Fast mode required for smooth operation';
    } else if (lines > 100000) {
      score -= 20;
      if (level !== 'poor') level = 'fair';
      message = 'Very Large Document';
      recommendation = 'Strongly recommended to use Ultra-Fast mode';
    }

    // Memory usage adjustment
    if (memoryUsage > 500) {
      score -= 25;
      level = 'poor';
      message += ' (High Memory)';
      recommendation = 'Enable memory optimization features';
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Auto-optimize large files
    const shouldAutoOptimize = sizeMB > 5 || lines > 10000;
    if (shouldAutoOptimize && !isOptimized) {
      setIsOptimized(true);
      onOptimizeChange(true);
    }

    setPerformanceMetrics({
      score,
      level,
      message,
      recommendation
    });
  }, [jsonSize, currentLines, memoryUsage, isOptimized, onOptimizeChange]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  const toggleOptimization = () => {
    const newState = !isOptimized;
    setIsOptimized(newState);
    onOptimizeChange(newState);
  };

  const getPerformanceColor = () => {
    switch (performanceMetrics.level) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPerformanceBgColor = () => {
    switch (performanceMetrics.level) {
      case 'excellent': return 'bg-green-500/20';
      case 'good': return 'bg-green-500/10';
      case 'fair': return 'bg-yellow-500/20';
      case 'poor': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getLevelIcon = () => {
    switch (performanceMetrics.level) {
      case 'excellent': return <Shield className="text-green-500" size={16} />;
      case 'good': return <Battery className="text-green-400" size={16} />;
      case 'fair': return <Timer className="text-yellow-500" size={16} />;
      case 'poor': return <Rocket className="text-red-500" size={16} />;
      default: return <Gauge size={16} />;
    }
  };

  const getSizeCategory = () => {
    const sizeMB = jsonSize / 1024 / 1024;
    if (sizeMB > 100) return 'Massive (>100MB)';
    if (sizeMB > 50) return 'Very Large (50-100MB)';
    if (sizeMB > 10) return 'Large (10-50MB)';
    if (sizeMB > 1) return 'Medium (1-10MB)';
    return 'Small (<1MB)';
  };

  const getEstimatedLines = () => {
    return currentLines || Math.ceil(jsonSize / 50);
  };

  return (
    <div className={`fixed top-24 right-4 z-30 w-80 rounded-xl border p-4 backdrop-blur-sm transition-all ${
      theme === 'dark' 
        ? 'bg-gray-900/90 border-gray-700 text-gray-300 shadow-2xl' 
        : 'bg-white/95 border-gray-300 text-gray-700 shadow-xl'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getLevelIcon()}
          <h4 className="font-semibold text-sm">Performance Optimizer</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-1 rounded ${
              theme === 'dark' 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-200'
            }`}
            title={showDetails ? "Hide details" : "Show details"}
          >
            <Gauge size={14} />
          </button>
          <button
            onClick={toggleOptimization}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isOptimized
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                : theme === 'dark'
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300'
                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700'
            }`}
          >
            {isOptimized ? 'ULTRA-FAST' : 'NORMAL'}
          </button>
        </div>
      </div>
      
      {/* Performance Score */}
      <div className={`mb-4 p-3 rounded-lg ${getPerformanceBgColor()} border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getPerformanceColor().replace('text-', 'bg-')}`} />
            <span className="text-sm font-medium">Performance Score</span>
          </div>
          <div className={`text-lg font-bold ${getPerformanceColor()}`}>
            {performanceMetrics.score.toFixed(0)}%
          </div>
        </div>
        
        {/* Progress bar */}
        <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              performanceMetrics.level === 'excellent' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              performanceMetrics.level === 'good' ? 'bg-gradient-to-r from-green-400 to-teal-400' :
              performanceMetrics.level === 'fair' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
            style={{ width: `${performanceMetrics.score}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs opacity-80">
          {performanceMetrics.message}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <MemoryStick size={12} className="text-blue-400" />
            <span className="text-xs font-medium">File Size</span>
          </div>
          <div className="text-lg font-bold">
            {(jsonSize / 1024 / 1024).toFixed(2)} MB
          </div>
          <div className="text-xs opacity-70 mt-1">
            {getSizeCategory()}
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={12} className="text-purple-400" />
            <span className="text-xs font-medium">Estimated Lines</span>
          </div>
          <div className="text-lg font-bold">
            {getEstimatedLines().toLocaleString()}
          </div>
          <div className="text-xs opacity-70 mt-1">
            ~{Math.ceil(getEstimatedLines() / 1000)}k lines
          </div>
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Optimization Details</span>
            <Zap size={12} className="text-yellow-500" />
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="opacity-70">Memory Usage:</span>
              <span className="font-medium">
                {memoryUsage > 0 ? `${memoryUsage.toFixed(1)} MB` : 'Calculating...'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="opacity-70">Processing Time:</span>
              <span className="font-medium">
                {processingTime > 0 ? `${processingTime.toFixed(0)}ms` : '--'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="opacity-70">Optimization Level:</span>
              <span className={`font-medium capitalize ${getPerformanceColor()}`}>
                {performanceMetrics.level}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-start gap-2 mb-2">
          <Zap size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium mb-1">Recommendation</div>
            <p className="text-xs opacity-90 leading-tight">
              {performanceMetrics.recommendation}
            </p>
          </div>
        </div>
        
        {isOptimized && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-medium">
              Ultra-Fast mode active
            </span>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 text-xs opacity-70 space-y-1">
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>•</span>
          <span>Files {'>'}5MB auto-enable Ultra-Fast mode</span>
        </div>
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`}>•</span>
          <span>Reduces memory usage by up to 90%</span>
        </div>
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`}>•</span>
          <span>Handles 500k+ lines in {"<"}1 second</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`mt-4 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <div className="text-xs opacity-60">
          {isOptimized ? (
            <span className="flex items-center gap-1 text-green-400">
              <Zap size={10} className="animate-pulse" />
              Ultra-Fast Active
            </span>
          ) : (
            <span>Normal Mode</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={calculateMetrics}
            className="text-xs opacity-70 hover:opacity-100 transition"
            title="Re-calculate metrics"
          >
            Refresh
          </button>
          <div className="text-xs opacity-60">
            v3.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizer;