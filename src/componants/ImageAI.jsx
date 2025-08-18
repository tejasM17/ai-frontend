import React, { useState } from 'react';
import axios from 'axios';

const ImageAI = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageSrc(null);
    try {
      const res = await axios.post('http://localhost:5000/ai/imgai', { prompt });
      setImageSrc(res.data.image); // Base64 string
    } catch {
      setError('Failed to generate image. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Image Generation AI</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt (e.g., 'A red sports car')"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>
      {error && <p >{error}</p>}
      {imageSrc && (
        <div >
          <img src={imageSrc} alt="Generated Image" className="w-full rounded-md shadow-sm" />
        </div>
      )}
    </div>
  );
};

export default ImageAI;