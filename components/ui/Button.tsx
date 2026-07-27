import React from 'react';
import type { ButtonHTMLAttributes } from 'react';

// Menentukan tipe data untuk props komponen
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'; // Tambahkan variant lain jika perlu
  size?: 'sm' | 'md' | 'lg';                    // Tambahkan size lain jika perlu
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  // Membuat daftar class BEM secara dinamis
  const baseClass = 'btn';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size}`;
  const fullWidthClass = fullWidth ? `${baseClass}--full-width` : '';

  // Menggabungkan semua class bawaan, BEM, dan className tambahan dari luar
  const combinedClasses = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;