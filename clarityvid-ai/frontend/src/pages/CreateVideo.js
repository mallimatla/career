import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { videoAPI } from '../services/api';
import { toast } from 'react-toastify';
import './CreateVideo.css';

const CreateVideo = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceType: 'text',
    sourceText: '',
    language: 'en',
    voiceGender: 'neutral',
  });
  const [file, setFile] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setFormData({ ...formData, sourceType: acceptedFiles[0].name.split('.').pop() });
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStepOne = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData, file };
      const response = await videoAPI.create(data);
      setVideoId(response.data.video.id);
      toast.success('Video created! Now generating script...');
      setStep(2);

      // Auto-generate script
      const scriptResponse = await videoAPI.generateScript(response.data.video.id);
      setScript(scriptResponse.data.script);
      toast.success('Script generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create video');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);

    try {
      await videoAPI.generate(videoId, {
        resolution: '1080p',
        format: 'mp4',
      });
      toast.success('Video generation started! You will be notified when ready.');
      navigate('/videos');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start video generation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-video">
      <header className="create-header">
        <div className="container">
          <h1>Create New Video</h1>
          <p>Transform your content into engaging whiteboard animations</p>
        </div>
      </header>

      <main className="create-main">
        <div className="container">
          <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Upload Content</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Review Script</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Generate Video</span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStepOne} className="create-form">
              <div className="card">
                <h3>Video Details</h3>

                <div className="form-group">
                  <label htmlFor="title">Video Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="My Explainer Video"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Brief description of your video"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select id="language" name="language" value={formData.language} onChange={handleChange}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="voiceGender">Voice Gender</label>
                    <select id="voiceGender" name="voiceGender" value={formData.voiceGender} onChange={handleChange}>
                      <option value="neutral">Neutral</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Source Content</h3>

                <div className="source-tabs">
                  <button
                    type="button"
                    className={`tab ${formData.sourceType === 'text' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, sourceType: 'text' })}
                  >
                    Text Input
                  </button>
                  <button
                    type="button"
                    className={`tab ${formData.sourceType !== 'text' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, sourceType: 'file' })}
                  >
                    Upload File
                  </button>
                </div>

                {formData.sourceType === 'text' ? (
                  <div className="form-group">
                    <label htmlFor="sourceText">Enter Your Content</label>
                    <textarea
                      id="sourceText"
                      name="sourceText"
                      value={formData.sourceText}
                      onChange={handleChange}
                      rows="10"
                      required
                      placeholder="Paste your content here..."
                    />
                  </div>
                ) : (
                  <div {...getRootProps()} className="dropzone">
                    <input {...getInputProps()} />
                    {file ? (
                      <div className="file-preview">
                        <p>📄 {file.name}</p>
                        <button type="button" onClick={() => setFile(null)}>Remove</button>
                      </div>
                    ) : (
                      <div className="dropzone-content">
                        <p>Drag and drop a file here, or click to select</p>
                        <small>Supported: PDF, DOCX, PPTX, TXT, MD</small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Creating...' : 'Continue to Script'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="script-editor">
              <div className="card">
                <h3>Generated Script</h3>
                <p className="mb-3">Review and edit your script before generating the video</p>

                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows="20"
                  className="script-textarea"
                />

                <div className="script-actions">
                  <button onClick={() => setStep(1)} className="btn btn-secondary">
                    Back
                  </button>
                  <button onClick={handleGenerate} className="btn btn-primary" disabled={loading}>
                    {loading ? 'Generating Video...' : 'Generate Video'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateVideo;
