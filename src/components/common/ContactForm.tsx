import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  subject: z.string().min(5, '主题至少需要5个字符'),
  message: z.string().min(10, '消息至少需要10个字符'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, onError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Submit to Netlify Functions
      const response = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        reset();
        onSuccess?.();
      } else {
        throw new Error(result.error || '提交失败');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      onError?.(error instanceof Error ? error.message : '提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">联系我们</h2>
      
      {/* Netlify Forms fallback - hidden form for form detection */}
      <form name="contact" netlify netlify-honeypot="bot-field" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="subject" />
        <textarea name="message"></textarea>
      </form>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Honeypot field for spam protection */}
        <input type="hidden" name="bot-field" />
        <input type="hidden" name="form-name" value="contact" />

        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            姓名 *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入您的姓名"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱 *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入您的邮箱地址"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Subject field */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            主题 *
          </label>
          <input
            {...register('subject')}
            type="text"
            id="subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入消息主题"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Message field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            消息 *
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="请输入您的消息内容"
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '发送中...' : '发送消息'}
        </button>

        {/* Status messages */}
        {submitStatus === 'success' && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            消息发送成功！我们会尽快回复您。
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            发送失败，请稍后重试。
          </div>
        )}
      </form>
    </div>
  );
};