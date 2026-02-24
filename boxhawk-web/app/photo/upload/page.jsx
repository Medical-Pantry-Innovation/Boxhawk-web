'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function UploadPage() {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: ''
  })
  const fileInputRef = useRef(null)
  const router = useRouter()

  const minImages = 4
  const maxImages = 10

  // Generate UUID compatible with all browsers
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback for browsers that don't support crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Check user permissions
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/login')
          return
        }
        
        const role = session.user.app_metadata?.role || 'photouser'
        setUserRole(role)
        
        // Check if user has permission to access upload page
        const allowedRoles = ['photouser', 'admin', 'superadmin']
        if (!allowedRoles.includes(role)) {
          router.push('/')
          return
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      }
    }
    
    checkUser()
  }, [router])

  // Check if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    addImages(files)
  }

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    addImages(files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // Add images to state
  const addImages = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (images.length + imageFiles.length > maxImages) {
      setError(`Maximum ${maxImages} photos allowed`)
      return
    }

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        }])
      }
      reader.readAsDataURL(file)
    })

    setError(null)
  }

  // Remove image
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  // Take photo (mobile)
  const takePhoto = () => {
    if (isMobile()) {
      fileInputRef.current?.click()
    } else {
      // Desktop fallback
      fileInputRef.current?.click()
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Upload images
  const uploadImages = async () => {
    if (images.length < minImages) {
      setError(`Minimum ${minImages} photos required`)
      return
    }

    if (!formData.name.trim()) {
      setError('Item name is required')
      return
    }

    if (!formData.manufacturer.trim()) {
      setError('Manufacturer is required')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      console.log('Starting upload process...')
      
      // First, let's test if we can access Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User authentication failed')
      }
      console.log('User authenticated:', user.email)

      // Skip bucket listing check since mp-images is public
      console.log('Skipping bucket list check for public bucket mp-images')

      // Use new storage structure: photo/uploads/YYYY/MM/uuid.ext
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const basePath = `photo/uploads/${year}/${month}`
      
      const uploadedPaths = []
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        const fileExt = image.file.name.split('.').pop()
        const fileName = `${generateUUID()}.${fileExt}`
        const filePath = `${basePath}/${fileName}`

        console.log(`Uploading ${fileName} to ${filePath}`)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('mp-images')
          .upload(filePath, image.file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        // Store relative path for photo_submission_images table
        uploadedPaths.push({
          path: filePath,
          size: image.file.size,
          mime: image.file.type
        })
        setUploadProgress(((i + 1) / images.length) * 100)
      }

      console.log('All images uploaded successfully:', uploadedPaths)

      // Get current user (reuse from earlier check)
      if (!user) {
        throw new Error('User authentication failed')
      }

      // Create submission first (let database generate ID)
      const { data: submission, error: submissionError } = await supabase
        .from('photo_submissions')
        .insert({
          created_by: user.id,
          name: formData.name.trim(),
          manufacturer: formData.manufacturer.trim(),
          status: 'in_review',
          reviewed: false
        })
        .select('id')
        .single()

      if (submissionError) {
        console.error('Submission creation error:', submissionError)
        throw new Error(`Submission creation failed: ${submissionError.message}`)
      }

      console.log('Successfully created submission:', submission.id)

      // Register images in photo_submission_images table
      const { error: imagesError } = await supabase
        .from('photo_submission_images')
        .insert(
          uploadedPaths.map(img => ({
            submission_id: submission.id,
            storage_path: img.path,
            size_bytes: img.size,
            mime_type: img.mime
          }))
        )

      if (imagesError) {
        console.error('Images registration error:', imagesError)
        throw new Error(`Images registration failed: ${imagesError.message}`)
      }

      console.log('Successfully registered images in photo_submission_images table')

      // Success - redirect to success page
      router.push('/success')

    } catch (error) {
      console.error('Upload error:', error)
      setError(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    )
  }

  return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px'
      }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Upload Photos
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: 0
          }}>
            Take photos of different sides of the item ({images.length}/{maxImages})
          </p>
        </div>

        {/* Upload Area */}
        <div
          style={{
            border: images.length > 0 ? 'none' : '2px dashed #6c5ce7',
            borderRadius: '12px',
            padding: images.length > 0 ? '0' : '40px',
            textAlign: 'center',
            backgroundColor: images.length > 0 ? 'transparent' : '#ffffff',
            marginBottom: '24px',
            cursor: images.length === 0 ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
          onClick={images.length === 0 ? takePhoto : undefined}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {images.length === 0 ? (
            <div>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                📷
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#6c5ce7',
                marginBottom: '8px'
              }}>
                Upload Photos
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: 0
              }}>
                {isMobile() 
                  ? 'Tap to open camera or select from gallery'
                  : 'Drag & drop images or click to select'
                }
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {images.map((image, index) => (
                <div key={image.id} style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Add more button */}
              {images.length < maxImages && (
                <div
                  onClick={takePhoto}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: '2px dashed #6c5ce7',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>+</div>
                  <div style={{ fontSize: '12px', color: '#6c5ce7' }}>
                    Add More
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Form Inputs */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Item Information
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333'
              }}>
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter item name"
                style={{
                  width:'114%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  transformOrigin:'left center',
                  transform: 'scale(0.875)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onClick={(e) => e.target.style.borderColor = '#6c5ce7'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#333'
              }}>
                Manufacturer *
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                placeholder="Enter manufacturer"
                style={{
                  width:'114%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  transformOrigin:'left center',
                  transform: 'scale(0.875)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onClick={(e) => e.target.style.borderColor = '#6c5ce7'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '16px',
              marginBottom: '12px',
              color: '#333'
            }}>
              Uploading... {Math.round(uploadProgress)}%
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#6c5ce7',
                transition: 'width 0.2s ease'
              }} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          {images.length > 0 && !uploading && (
            <>
              <button
                onClick={uploadImages}
                disabled={images.length < minImages}
                style={{
                  padding: '14px 32px',
                  backgroundColor: images.length < minImages ? '#ccc' : '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: images.length < minImages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Upload {images.length} Photos
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#4b5563',
          lineHeight: '1.7',
          boxShadow: '0 12px 24px rgba(15, 23, 42, 0.04)'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#1f2937', fontSize: '16px' }}>Tips for better photos</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Capture the front, back, and both sides so we can see the full packaging.</li>
            <li>Take close-ups of key details: product labels, barcodes, dates (manufacture and expiration), identification numbers, and any regulatory or recycling symbols.</li>
            <li>Use bright, even lighting and avoid glare or shadows. Retake any blurry shots.</li>
            <li>Keep the product centered in the frame and clear away cluttered backgrounds.</li>
            <li>Upload photos for only one product per submission—do not mix different items.</li>
            <li>Minimum 4 photos, maximum 10 photos. More angles help our experts verify the item quickly.</li>
          </ul>
        </div>
      </div>
      </div>
  )
}
