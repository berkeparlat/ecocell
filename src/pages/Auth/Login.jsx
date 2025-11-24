import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { loginUser } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Lock, Building2, Mail, HelpCircle, Phone, MessageCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
    
    if (!formData.email || !formData.password) {
      setError('Lütfen e-posta ve şifre girin!');
      return;
    }
    
    setLoading(true);

    // Firebase ile giriş
    const result = await loginUser(formData.email, formData.password);
    
    setLoading(false);

    if (result.success) {
      login(result.user);
      navigate('/main-menu');
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
          <h2 className="auth-brand">Ecocell Portal</h2>
          <p className="auth-subtitle">
            Giriş yapın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <Input
            label="E-posta"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-posta adresinizi girin"
            icon={<Mail size={20} />}
          />

          <Input
            label="Şifre"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Şifrenizi girin"
            icon={<Lock size={20} />}
          />

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            size="large"
            disabled={loading}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>

        <div className="auth-switch">
          <p>
            Hesabınız yok mu?{' '}
            <button 
              type="button"
              className="auth-switch-btn"
              onClick={() => navigate('/register')}
            >
              Kayıt Ol
            </button>
          </p>
        </div>

        <div className="auth-help">
          <button 
            type="button"
            className="help-trigger-btn"
            onClick={() => setShowHelp(!showHelp)}
          >
            <HelpCircle size={20} />
            <span>Yardım & Destek</span>
          </button>
          
          {showHelp && (
            <div className="help-content">
              <div className="help-header">
                <HelpCircle size={24} />
                <h3>Yardım & Destek</h3>
              </div>
              <p className="help-text">
                Görüş, istek, sorun ve şikayetleriniz için benimle iletişime geçebilirsiniz.
              </p>
              <div className="help-contact">
                <div className="contact-item">
                  <Phone size={20} />
                  <a href="tel:+905512342632">0551 234 26 32</a>
                </div>
                <div className="contact-item">
                  <Mail size={20} />
                  <a href="mailto:berke.parlat27@gmail.com">berke.parlat27@gmail.com</a>
                </div>
              </div>
              <div className="help-footer">
                <small>Hazırlayan: Berke Parlat</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
