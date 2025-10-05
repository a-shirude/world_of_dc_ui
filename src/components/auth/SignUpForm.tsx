import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authService } from '../../services/authService';
import { RegisterData } from '../../types';

type Step = 'mobile' | 'otp' | 'details';

const SignUpForm: React.FC = () => {
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm<RegisterData>();

  const sendOtp = async () => {
    try {
      setError('');
      setIsLoading(true);
      await authService.sendOtp(mobile);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setError('');
      setIsLoading(true);
      await authService.verifyOtp(mobile, otp);
      setStep('details');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterData) => {
    try {
      setError('');
      setIsLoading(true);
      const payload: RegisterData = { ...data, mobileNumber: mobile };
      await authService.register(payload);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>

          <p className="mt-2 text-center text-sm text-gray-600">Sign up with your mobile number</p>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        {step === 'mobile' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Mobile number</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              type="tel"
              placeholder="9000000000"
              className="appearance-none rounded-md relative block w-full pl-3 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button
              onClick={sendOtp}
              disabled={isLoading || mobile.trim().length < 10}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="text-center text-sm text-gray-600">
              <Link to="/login" className="text-blue-600">Sign in instead</Link>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              placeholder="123456"
              className="appearance-none rounded-md relative block w-full pl-3 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={verifyOtp}
                disabled={isLoading || otp.trim().length < 4}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={sendOtp}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
              >
                Resend
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <form className="space-y-4" onSubmit={handleSubmit(onRegister)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input {...register('name')} type="text" className="mt-1 block w-full rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
              <input {...register('email')} type="email" className="mt-1 block w-full rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address (optional)</label>
              <input {...register('address')} type="text" className="mt-1 block w-full rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhar Number (optional)</label>
              <input {...register('aadharNumber')} type="text" className="mt-1 block w-full rounded-md border-gray-300" />
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50">
                {isLoading ? 'Registering...' : 'Create account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
