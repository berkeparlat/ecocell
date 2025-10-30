import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { registerUser } from '../../services/authService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { User, Lock, Mail, Building2 } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { departments } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  });

  useEffect(() => {
    if (!Array.isArray(departments) || departments.length === 0) {
      return;
    }

    setFormData((prev) => {
      if (prev.department && departments.includes(prev.department)) {
        return prev;
      }
      return {
        ...prev,
        department: '',
      };
    });
  }, [departments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyon
    if (!formData.fullName || !formData.email || !formData.password || !formData.department) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    setLoading(true);

    // Firebase'e kayıt
    const result = await registerUser(
      formData.email,
      formData.password,
      formData.fullName,
      formData.department
    );

    setLoading(false);

    if (result.success) {
      alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Building2 size={40} />
          </div>
          <h1 className="auth-title">Karafiber Elyaf</h1>
          <h2 className="auth-brand">Genel Takip Sistemi</h2>
          <p className="auth-subtitle">
            Yeni hesap oluşturun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <Input
            label="Ad Soyad"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Adınızı ve soyadınızı girin"
            icon={<User size={18} />}
          />

          <Input
            label="E-posta"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-posta adresinizi girin"
            icon={<Mail size={18} />}
          />

          <Select
            label="Birim"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={(departments || []).map(dept => ({ value: dept, label: dept }))}
            placeholder="Biriminizi seçin"
          />

          <Input
            label="Şifre"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Şifrenizi girin (en az 6 karakter)"
            icon={<Lock size={18} />}
          />

          <Input
            label="Şifre Tekrar"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Şifrenizi tekrar girin"
            icon={<Lock size={18} />}
          />

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            size="large"
            disabled={loading}
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </Button>
        </form>

        <div className="auth-switch">
          <p>
            Zaten hesabınız var mı?{' '}
            <button 
              type="button"
              className="auth-switch-btn"
              onClick={() => navigate('/')}
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
