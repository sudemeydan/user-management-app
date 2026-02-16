import React, { useState } from 'react';


const Login = ({ onLogin, onRegister }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    age: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      onRegister(formData); 
    } else {
      onLogin(formData.email, formData.password); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegisterMode ? '🚀 Aramıza Katıl' : '👋 Hoş Geldin'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {}
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">İsim</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Adın Soyadın"
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Kullanıcı Adı"
                  onChange={handleChange}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700">Yaş</label>
                  <input
                    name="age"
                    type="number"
                    placeholder="25"
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-2/3">
                  <label className="block text-sm font-medium text-gray-700">Adres</label>
                  <input
                    name="address"
                    type="text"
                    placeholder="İstanbul..."
                    onChange={handleChange}
                    className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              placeholder="ornek@email.com"
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              name="password"
              type="password"
              placeholder="******"
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isRegisterMode ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="ml-2 text-blue-600 hover:underline font-medium"
          >
            {isRegisterMode ? 'Giriş Yap' : 'Hemen Kaydol'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;