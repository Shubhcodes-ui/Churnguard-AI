import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

const signupSchema = z.object({
  full_name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function SignupPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/api/auth/signup', data);
      const { access_token, refresh_token, user } = response.data;
      login(user, access_token, refresh_token);
      navigate('/');
    } catch (err) {
      setError('root', { message: err.response?.data?.detail || 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-cg-base flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-cg-surface border border-cg-border p-8 rounded-2xl shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-cg-brand text-cg-base rounded-xl mx-auto flex items-center justify-center font-extrabold shadow-lg shadow-cg-brand/20">
            <Shield className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-cg-primary tracking-tight">Create Enterprise Workspace</h1>
          <p className="text-xs text-cg-muted">Get started with automated churn intelligence</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cg-muted uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              {...register('full_name')}
              type="text"
              className="w-full bg-cg-base border border-cg-border rounded-lg px-3.5 py-2.5 text-xs text-cg-primary focus:outline-none focus:border-cg-brand transition-all"
              placeholder="Sarah Jenkins"
            />
            {errors.full_name && <p className="text-cg-risk text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-cg-muted uppercase tracking-wider mb-1.5">Work Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-cg-base border border-cg-border rounded-lg px-3.5 py-2.5 text-xs text-cg-primary focus:outline-none focus:border-cg-brand transition-all"
              placeholder="s.jenkins@enterprise.com"
            />
            {errors.email && <p className="text-cg-risk text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-cg-muted uppercase tracking-wider mb-1.5">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-cg-base border border-cg-border rounded-lg px-3.5 py-2.5 text-xs text-cg-primary focus:outline-none focus:border-cg-brand transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-cg-risk text-xs mt-1">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <div className="p-3 bg-cg-risk/10 border border-cg-risk/30 rounded-lg text-cg-risk text-xs text-center font-medium">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cg-brand hover:bg-[#D4A143] text-cg-base font-bold text-xs py-2.5 px-4 rounded-lg shadow-lg shadow-cg-brand/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            <span>{isSubmitting ? 'Creating account...' : 'Initialize Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-cg-muted text-xs pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-cg-brand hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
