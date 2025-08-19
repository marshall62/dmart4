'use client';
import { useState } from 'react';
import styles from './LoginPage.module.css'; // Assuming you have a CSS module for styling
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic client-side validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      console.log('Attempting to log in with:', { username });
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Authentication successful, redirect to dashboard or store token
        // Example:
        
        console.log('Login successful:', data);
        setError('');
        router.push('/dashboard');
      } else {
        console.log("login unsuccessful", data);
        // Authentication failed, display error message
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    }
  };
return <div className={styles['login-container']}>
  <h1>Login</h1>
  {error && <p className={styles['error-message']}>{error}</p>}
     <form onSubmit={handleSubmit}>
       <div className={styles['input-group']}>
         <label htmlFor="username">Username:</label>
         <input
           type="text"
           id="username"
           value={username}
           onChange={(e) => setUsername(e.target.value)}
         />
       </div>
       <div className={styles['input-group']}>
         <label htmlFor="password">Password:</label>
         <input
           type="password"
           id="password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
         />
       </div>
       <button className={styles['submit-button']} type="submit">Login</button>
     </form>

</div>
};

