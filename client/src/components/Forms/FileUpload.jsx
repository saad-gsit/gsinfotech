import React, { useState, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    Grid,
    Card,
    CardMedia,
    CardActions,
    IconButton,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Slider,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    Visibility,
    Crop,
    Check,
    Error as ErrorIcon,
    Close,
    Download
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({
    onFilesChange,
    existingFiles = [],
    maxFiles = 10,
    maxSize = 5 * 1024 * 1024, // 5MB
    acceptedTypes = {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    enableCrop = false,
    enableResize = false,
    showPreview = true,
    multiple = true
}) => {
    const [files, setFiles] = useState(existingFiles);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [errors, setErrors] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [cropDialog, setCropDialog] = useState({ open: false, file: null });

    // File validation
    const validateFile = (file) => {
        const errors = [];

        if (file.size > maxSize) {
            errors.push(`File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}`);
        }

        // Check file type
        const isValidType = Object.values(acceptedTypes).flat().some(type =>
            file.name.toLowerCase().endsWith(type.replace('.', ''))
        );

        if (!isValidType) {
            errors.push(`File "${file.name}" has invalid type. Accepted types: ${Object.values(acceptedTypes).flat().join(', ')}`);
        }

        return errors;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Simulate file upload with progress
    const uploadFile = async (file) => {
        return new Promise((resolve) => {
            const fileId = Date.now() + Math.random();
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = Math.min((prev[fileId] || 0) + Math.random() * 30, 100);
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            setUploadProgress(prev => {
                                const { [fileId]: removed, ...rest } = prev;
                                return rest;
                            });
                        }, 1000);
                    }
                    return { ...prev, [fileId]: newProgress };
                });
            }, 200);

            setTimeout(() => {
                resolve({
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: URL.createObjectURL(file),
                    uploadedAt: new Date().toISOString(),
                    status: 'uploaded'
                });
            }, 2000 + Math.random() * 3000);
        });
    };

    const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
        // Handle rejected files
        if (rejectedFiles.length > 0) {
            const newErrors = rejectedFiles.map(({ file, errors }) =>
                errors.map(e => `${file.name}: ${e.message}`).join(', ')
            );
            setErrors(prev => [...prev, ...newErrors]);
        }

        // Validate accepted files
        const validFiles = [];
        const validationErrors = [];

        acceptedFiles.forEach(file => {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                validationErrors.push(...fileErrors);
            } else {
                validFiles.push(file);
            }
        });

        if (validationErrors.length > 0) {
            setErrors(prev => [...prev, ...validationErrors]);
        }

        // Check file limit
        if (files.length + validFiles.length > maxFiles) {
            setErrors(prev => [...prev, `Cannot upload more than ${maxFiles} files`]);
            return;
        }

        if (validFiles.length === 0) return;

        setUploading(true);

        try {
            const uploadPromises = validFiles.map(uploadFile);
            const uploadedFiles = await Promise.all(uploadPromises);

            const newFiles = [...files, ...uploadedFiles];
            setFiles(newFiles);
            onFilesChange(newFiles);
        } catch (error) {
            setErrors(prev => [...prev, 'Upload failed. Please try again.']);
        } finally {
            setUploading(false);
        }
    }, [files, maxFiles, maxSize, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedTypes,
        multiple,
        disabled: uploading || files.length >= maxFiles
    });

    const removeFile = (fileId) => {
        const newFiles = files.filter(file => file.id !== fileId);
        setFiles(newFiles);
        onFilesChange(newFiles);
    };

    const clearErrors = () => {
        setErrors([]);
    };

    return (
        <Box>
            {/* Upload Area */}
            <Paper
                {...getRootProps()}
                sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'primary.50' : files.length >= maxFiles ? 'grey.100' : 'grey.50',
                    cursor: files.length >= maxFiles ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    opacity: uploading ? 0.6 : 1,
                    '&:hover': {
                        borderColor: files.length >= maxFiles ? 'grey.300' : 'primary.main',
                        bgcolor: files.length >= maxFiles ? 'grey.100' : 'primary.50'
                    }
                }}
            >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />

                {files.length >= maxFiles ? (
                    <Typography variant="h6" color="text.secondary">
                        Maximum files reached ({maxFiles})
                    </Typography>
                ) : isDragActive ? (
                    <Typography variant="h6" color="primary">
                        Drop files here...
                    </Typography>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Drag & drop files here
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            or click to select files
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Maximum {maxFiles} files, {formatFileSize(maxSize)} each
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            {Object.values(acceptedTypes).flat().map((type, index) => (
                                <Chip
                                    key={index}
                                    label={type}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                />
                            ))}
                        </Box>
                    </>
                )}

                {uploading && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Uploading files...
                        </Typography>
                        <LinearProgress />
                    </Box>
                )}
            </Paper>

            {/* Errors */}
            {errors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <AnimatePresence>
                        {errors.map((error, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert
                                    severity="error"
                                    onClose={clearErrors}
                                    sx={{ mb: 1 }}
                                >
                                    {error}
                                </Alert>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </Box>
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <Box sx={{ mt: 2 }}>
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                        <Box key={fileId} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">
                                    Uploading...
                                </Typography>
                                <Typography variant="body2">
                                    {Math.round(progress)}%
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} />
                        </Box>
                    ))}
                </Box>
            )}

            {/* File List */}
            {files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Uploaded Files ({files.length}/{maxFiles})
                    </Typography>

                    <Grid container spacing={2}>
                        <AnimatePresence>
                            {files.map((file) => (
                                <Grid item xs={12} sm={6} md={4} key={file.id}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card>
                                            {showPreview && file.type?.startsWith('image/') && (
                                                <CardMedia
                                                    component="img"
                                                    height="140"
                                                    image={file.url}
                                                    alt={file.name}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                            )}

                                            <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" noWrap title={file.name}>
                                                        {file.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatFileSize(file.size)}
                                                    </Typography>
                                                    {file.status === 'uploaded' && (
                                                        <Chip
                                                            icon={<Check />}
                                                            label="Uploaded"
                                                            size="small"
                                                            color="success"
                                                            sx={{ ml: 1 }}
                                                        />
                                                    )}
                                                </Box>

                                                <Box>
                                                    {showPreview && file.type?.startsWith('image/') && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setPreviewFile(file)}
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    )}

                                                    {enableCrop && file.type?.startsWith('image/') && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setCropDialog({ open: true, file })}
                                                        >
                                                            <Crop />
                                                        </IconButton>
                                                    )}

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeFile(file.id)}
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            </CardActions>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    </Grid>
                </Box>
            )}

            {/* Preview Dialog */}
            {previewFile && (
                <Dialog
                    open={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {previewFile.name}
                        <IconButton onClick={() => setPreviewFile(null)}>
                            <Close />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <img
                            src={previewFile.url}
                            alt={previewFile.name}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            startIcon={<Download />}
                            href={previewFile.url}
                            download={previewFile.name}
                        >
                            Download
                        </Button>
                        <Button onClick={() => setPreviewFile(null)}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Crop Dialog (Basic implementation) */}
            {cropDialog.open && (
                <Dialog
                    open={cropDialog.open}
                    onClose={() => setCropDialog({ open: false, file: null })}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Crop Image</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Advanced cropping functionality would be implemented here
                        </Typography>
                        <img
                            src={cropDialog.file?.url}
                            alt="Crop preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '400px',
                                objectFit: 'contain'
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCropDialog({ open: false, file: null })}>
                            Cancel
                        </Button>
                        <Button variant="contained">
                            Apply Crop
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default FileUpload;