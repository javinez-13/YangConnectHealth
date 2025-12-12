'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../../../lib/api';
import { setAuthToken, setUser } from '../../../lib/auth';
import yangLogo from '../../../frontend/assets/yanglogo.jpg';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailErrorVisible, setEmailErrorVisible] = useState(false);
  const hideTimeoutRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        twoFactorCode: formData.twoFactorCode || undefined,
      });

      if (response.data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setLoading(false);
        return;
      }

      // Check if user is admin
      if (response.data.user.role !== 'admin') {
        setError('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }

      setAuthToken(response.data.token);
      setUser(response.data.user);
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      // Field-level message for authentication failure
      if (err.response?.status === 401 || /credential/i.test(err.response?.data?.error || '')) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setEmailError('Incorrect email or password');
        setEmailErrorVisible(true);
      }
      // Handle validation errors from express-validator
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors.map(e => e.msg).join(', ');
        setError(validationErrors);
      } else if (err.response?.data?.error) {
        if (!emailError) setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, []);

  const hideEmailErrorUserInitiated = (e) => {
    if (!e?.nativeEvent?.isTrusted) return;
    if (!emailError) return;
    setEmailErrorVisible(false);
    hideTimeoutRef.current = setTimeout(() => {
      setEmailError('');
      hideTimeoutRef.current = null;
    }, 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image src={yangLogo} alt="YangConnect HealthPortal logo" className="h-16 w-16 rounded-full object-cover ring-4 ring-primary ring-offset-2" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-primary">YangConnect HealthPortal</h2>
          <p className="mt-2 text-sm text-neutral-dark">Administrator sign in</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              {emailError && (
                <p className={`text-sm text-red-600 mt-1 transition-opacity duration-200 ${emailErrorVisible ? 'opacity-100' : 'opacity-0'}`}>{emailError}</p>
              )}
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`input-field ${emailError ? 'ring-1 ring-red-400' : ''}`}
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={hideEmailErrorUserInitiated}
                onMouseDown={hideEmailErrorUserInitiated}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={hideEmailErrorUserInitiated}
                  onMouseDown={hideEmailErrorUserInitiated}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-dark" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-dark" />
                  )}
                </button>
              </div>
            </div>

            {requiresTwoFactor && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <label htmlFor="twoFactorCode" className="label mb-0">Two-Factor Authentication Code</label>
                </div>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  className="input-field"
                  placeholder="Enter 6-digit code"
                  value={formData.twoFactorCode}
                  onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                  maxLength={6}
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-neutral rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-dark">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-neutral-dark hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Patient Login
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-dark">
            Administrator access requires admin role privileges
          </p>
        </div>
      </div>
    </div>
  );
}

