// Simplified ProjectForm.jsx - Data Entry Form
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    Typography,
    Divider,
    Paper,
    Card,
    CardContent,
    IconButton,
    Chip,
    Stack,
    Alert,
    LinearProgress,
    Checkbox,
    ListItemText,
    OutlinedInput,
    InputAdornment,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Work,
    Category,
    Link,
    DateRange,
    Star,
    Image,
    CloudUpload,
    Close,
    Edit,
    Launch,
    GitHub,
    Save,
    Check,
    Warning,
    Code,
    Business,
    Description,
    Title,
    Settings,
    Delete,
    Archive
} from '@mui/icons-material';

// Validation Schema
const projectSchema = yup.object({
    title: yup
        .string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must be less than 200 characters'),

    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be less than 2000 characters'),

    shortDescription: yup
        .string()
        .max(500, 'Short description must be less than 500 characters'),

    overview: yup
        .string()
        .min(50, 'Overview must be at least 50 characters')
        .max(1000, 'Overview must be less than 1000 characters'),

    keyFeatures: yup
        .array()
        .of(yup.string().min(5, 'Each feature must be at least 5 characters'))
        .min(1, 'At least one key feature is required')
        .max(10, 'Maximum 10 key features allowed'),

    technicalImplementation: yup
        .string()
        .min(50, 'Technical implementation must be at least 50 characters')
        .max(2000, 'Technical implementation must be less than 2000 characters'),

    category: yup
        .string()
        .required('Category is required'),

    status: yup
        .string()
        .required('Status is required'),

    technologies: yup
        .array()
        .min(1, 'At least one technology is required')
        .max(15, 'Maximum 15 technologies allowed'),

    projectUrl: yup
        .string()
        .url('Must be a valid URL')
        .nullable()
        .transform((value) => value || null),

    githubUrl: yup
        .string()
        .url('Must be a valid URL')
        .nullable()
        .transform((value) => value || null),

    client: yup
        .string()
        .max(100, 'Client name must be less than 100 characters'),

    startDate: yup
        .string()
        .nullable(),

    endDate: yup
        .string()
        .nullable()
        .test('is-after-start', 'End date must be after start date', function (value) {
            const { startDate } = this.parent;
            if (!startDate || !value) return true;
            return new Date(value) >= new Date(startDate);
        }),

    // SEO fields
    seoTitle: yup
        .string()
        .max(60, 'SEO title should be less than 60 characters for optimal display'),

    seoDescription: yup
        .string()
        .max(160, 'SEO description should be less than 160 characters for optimal display'),

    seoKeywords: yup
        .array()
        .of(yup.string())
        .max(10, 'Maximum 10 SEO keywords allowed')
});

// Image Upload Component
const ImageUpload = ({ onImagesChange, existingImages = [], maxImages = 10, maxSize = 10 }) => {
    const [images, setImages] = useState(existingImages);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
        },
        multiple: true,
        maxFiles: maxImages,
        maxSize: maxSize * 1024 * 1024,
        onDrop: async (acceptedFiles) => {
            setUploading(true);

            try {
                const processedImages = acceptedFiles.map(file => {
                    const url = URL.createObjectURL(file);
                    return {
                        id: Date.now() + Math.random(),
                        url,
                        name: file.name,
                        size: file.size,
                        file,
                        type: file.type,
                        isNew: true
                    };
                });

                const newImages = [...images, ...processedImages];
                setImages(newImages);
                onImagesChange(newImages);
            } catch (error) {
                console.error('Image processing failed:', error);
            } finally {
                setUploading(false);
            }
        }
    });

    const removeImage = (imageId) => {
        const imageToRemove = images.find(img => img.id === imageId);
        if (imageToRemove?.url && imageToRemove.isNew) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        const newImages = images.filter(img => img.id !== imageId);
        setImages(newImages);
        onImagesChange(newImages);
    };

    const setFeaturedImage = (imageId) => {
        const newImages = images.map(img => ({
            ...img,
            isFeatured: img.id === imageId
        }));
        setImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <Box>
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                    }
                }}
            >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Drop images here' : 'Upload Project Images'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Click or drag images (max {maxSize}MB each, {maxImages} total)
                </Typography>
                {uploading && <CircularProgress sx={{ mt: 2 }} />}
            </Paper>

            {fileRejections.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Some files were rejected:
                    </Typography>
                    {fileRejections.map(({ file, errors }, index) => (
                        <Typography key={index} variant="caption" display="block">
                            • {file.name}: {errors[0]?.message}
                        </Typography>
                    ))}
                </Alert>
            )}

            {images.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {images.map((image) => (
                        <Grid item xs={6} sm={4} md={3} key={image.id}>
                            <Card sx={{ position: 'relative' }}>
                                <Box sx={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />

                                    {image.isFeatured && (
                                        <Chip
                                            icon={<Star />}
                                            label="Featured"
                                            size="small"
                                            color="primary"
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                left: 4,
                                                zIndex: 1
                                            }}
                                        />
                                    )}

                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            display: 'flex',
                                            gap: 0.5
                                        }}
                                    >
                                        <Tooltip title="Set as featured">
                                            <IconButton
                                                size="small"
                                                onClick={() => setFeaturedImage(image.id)}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                                }}
                                            >
                                                <Star
                                                    fontSize="small"
                                                    color={image.isFeatured ? 'primary' : 'action'}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remove">
                                            <IconButton
                                                size="small"
                                                onClick={() => removeImage(image.id)}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                                }}
                                            >
                                                <Close fontSize="small" color="error" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 1 }}>
                                    <Typography variant="caption" noWrap>
                                        {image.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

const ProjectForm = ({
    project = null,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = 'create'
}) => {
    const [projectImages, setProjectImages] = useState([]);
    const [formProgress, setFormProgress] = useState(0);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue
    } = useForm({
        resolver: yupResolver(projectSchema),
        defaultValues: {
            title: '',
            description: '',
            shortDescription: '',
            overview: '',
            keyFeatures: [''],
            technicalImplementation: '',
            category: 'web_application',
            status: 'draft',
            technologies: [],
            projectUrl: '',
            githubUrl: '',
            client: '',
            startDate: '',
            endDate: '',
            featured: false,
            seoTitle: '',
            seoDescription: '',
            seoKeywords: []
        },
        mode: 'onChange'
    });

    const watchedFields = watch();

    // Categories and technologies
    const categories = [
        { value: 'web_application', label: 'Web Application', icon: '🌐' },
        { value: 'mobile_application', label: 'Mobile Application', icon: '📱' },
        { value: 'desktop_application', label: 'Desktop Application', icon: '💻' },
        { value: 'e_commerce', label: 'E-Commerce', icon: '🛒' },
        { value: 'cms', label: 'CMS', icon: '📝' },
        { value: 'api', label: 'API Development', icon: '🔗' }
    ];

    const availableTechnologies = [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
        'PHP', 'Laravel', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SASS',
        'Tailwind CSS', 'Bootstrap', 'React Native', 'Flutter', 'Swift', 'Kotlin',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase', 'Next.js',
        'Nuxt.js', 'GraphQL', 'Redis', 'Elasticsearch', 'Material-UI', 'Ant Design'
    ];

    const seoKeywords = [
        'web development', 'mobile app', 'e-commerce', 'user interface', 'user experience',
        'responsive design', 'modern website', 'custom software', 'digital solution',
        'technology stack', 'full stack', 'frontend', 'backend', 'database design'
    ];

    // Initialize form with project data
    useEffect(() => {
        if (project) {
            reset({
                title: project.title || '',
                description: project.description || '',
                shortDescription: project.short_description || '',
                overview: project.overview || '',
                keyFeatures: project.key_features || [''],
                technicalImplementation: project.technical_implementation || '',
                category: project.category || 'web_application',
                status: project.status || 'draft',
                technologies: project.technologies || [],
                projectUrl: project.project_url || '',
                githubUrl: project.github_url || '',
                client: project.client_name || project.client || '',
                startDate: project.start_date ? project.start_date.split('T')[0] : '',
                endDate: project.completion_date ? project.completion_date.split('T')[0] : '',
                featured: project.featured || false,
                seoTitle: project.seo_title || '',
                seoDescription: project.seo_description || '',
                seoKeywords: project.seo_keywords || []
            });
            setProjectImages(project.images || []);
        }
    }, [project, reset]);

    // Calculate form progress
    useEffect(() => {
        const requiredFields = ['title', 'description', 'category', 'technologies', 'overview', 'keyFeatures'];
        const completedFields = requiredFields.filter(field => {
            const value = watchedFields[field];
            if (field === 'keyFeatures') {
                return value && Array.isArray(value) && value.length > 0 && value[0].trim() !== '';
            }
            return value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '');
        });
        setFormProgress((completedFields.length / requiredFields.length) * 100);
    }, [watchedFields]);

    // Auto-generate SEO fields
    useEffect(() => {
        if (watchedFields.title && !watchedFields.seoTitle) {
            setValue('seoTitle', watchedFields.title.substring(0, 60));
        }
        if (watchedFields.description && !watchedFields.seoDescription) {
            setValue('seoDescription', watchedFields.description.substring(0, 160));
        }
    }, [watchedFields.title, watchedFields.description, setValue, watchedFields.seoTitle, watchedFields.seoDescription]);

    const onFormSubmit = async (data) => {
        try {
            const imagesToUpload = projectImages
                .filter(img => img.file)
                .map(img => img.file);

            const formData = {
                ...data,
                images: imagesToUpload,
                existingImages: projectImages.filter(img => !img.file)
            };

            await onSubmit(formData, imagesToUpload);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {mode === 'edit' ? 'Edit Project' : 'Create New Project'}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    {mode === 'edit'
                        ? 'Update your project information and settings'
                        : 'Fill in the details for your new project'
                    }
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Form Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {Math.round(formProgress)}% complete
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={formProgress}
                        sx={{ height: 6, borderRadius: 3 }}
                    />
                </Box>
            </Box>

            <form onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container spacing={4}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Work />
                            Basic Information
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Project Title"
                                    error={!!errors.title}
                                    helperText={errors.title?.message || 'Enter a descriptive title for your project'}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Title />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Controller
                            name="client"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Client Name"
                                    error={!!errors.client}
                                    helperText={errors.client?.message || 'Optional: Client or company name'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Business />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.category}>
                                    <InputLabel>Project Category *</InputLabel>
                                    <Select
                                        {...field}
                                        label="Project Category *"
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <span>{category.icon}</span>
                                                    {category.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.category && (
                                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                            {errors.category.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.status}>
                                    <InputLabel>Project Status *</InputLabel>
                                    <Select
                                        {...field}
                                        label="Project Status *"
                                    >
                                        <MenuItem value="draft">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Edit fontSize="small" />
                                                Draft
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="published">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Check fontSize="small" />
                                                Published
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="archived">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Archive fontSize="small" />
                                                Archived
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                    {errors.status && (
                                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                            {errors.status.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="shortDescription"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Short Description"
                                    error={!!errors.shortDescription}
                                    helperText={errors.shortDescription?.message || 'Brief summary for project cards (recommended)'}
                                    placeholder="A concise overview of the project for display cards"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Description />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Full Description"
                                    multiline
                                    rows={4}
                                    error={!!errors.description}
                                    helperText={errors.description?.message || 'Detailed description of the project, its goals, and achievements'}
                                    required
                                    placeholder="Describe the project in detail..."
                                />
                            )}
                        />
                    </Grid>

                    {/* Project Content */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                            <Description />
                            Project Content
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="overview"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Project Overview"
                                    multiline
                                    rows={4}
                                    error={!!errors.overview}
                                    helperText={errors.overview?.message || 'Provide a comprehensive overview of the project'}
                                    placeholder="Write an overview that covers the project's purpose, target audience, main objectives, and what problem it solves..."
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                            Key Features
                        </Typography>
                        <Controller
                            name="keyFeatures"
                            control={control}
                            render={({ field }) => {
                                const addFeature = () => {
                                    field.onChange([...field.value, '']);
                                };

                                const removeFeature = (index) => {
                                    const newFeatures = field.value.filter((_, i) => i !== index);
                                    field.onChange(newFeatures);
                                };

                                const updateFeature = (index, value) => {
                                    const newFeatures = [...field.value];
                                    newFeatures[index] = value;
                                    field.onChange(newFeatures);
                                };

                                return (
                                    <Box>
                                        {field.value.map((feature, index) => (
                                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                                                <TextField
                                                    fullWidth
                                                    label={`Feature ${index + 1}`}
                                                    value={feature}
                                                    onChange={(e) => updateFeature(index, e.target.value)}
                                                    placeholder="Describe a key feature of your project..."
                                                    error={!!errors.keyFeatures?.[index]}
                                                    helperText={errors.keyFeatures?.[index]?.message}
                                                    multiline
                                                    rows={2}
                                                />
                                                {field.value.length > 1 && (
                                                    <IconButton
                                                        onClick={() => removeFeature(index)}
                                                        color="error"
                                                        sx={{ mt: 1 }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        ))}

                                        {errors.keyFeatures && !Array.isArray(errors.keyFeatures) && (
                                            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                                                {errors.keyFeatures.message}
                                            </Typography>
                                        )}

                                        <Button
                                            onClick={addFeature}
                                            variant="outlined"
                                            size="small"
                                            disabled={field.value.length >= 10}
                                            sx={{ mb: 2 }}
                                        >
                                            Add Feature ({field.value.length}/10)
                                        </Button>
                                    </Box>
                                );
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="technicalImplementation"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Technical Implementation"
                                    multiline
                                    rows={6}
                                    error={!!errors.technicalImplementation}
                                    helperText={errors.technicalImplementation?.message || 'Describe the technical aspects, architecture, and implementation details'}
                                    placeholder="Explain the technical implementation: architecture used, key technical decisions, challenges faced, solutions implemented, performance considerations, security measures, deployment strategy, etc..."
                                />
                            )}
                        />
                    </Grid>

                    {/* Technical Details */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                            <Code />
                            Technical Details
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="technologies"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.technologies}>
                                    <InputLabel>Technologies Used *</InputLabel>
                                    <Select
                                        {...field}
                                        multiple
                                        input={<OutlinedInput label="Technologies Used *" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" />
                                                ))}
                                            </Box>
                                        )}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 300,
                                                    width: 250,
                                                },
                                            },
                                        }}
                                    >
                                        {availableTechnologies.map((tech) => (
                                            <MenuItem key={tech} value={tech}>
                                                <Checkbox checked={field.value.indexOf(tech) > -1} />
                                                <ListItemText primary={tech} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.technologies && (
                                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                            {errors.technologies.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="projectUrl"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Live Project URL"
                                    type="url"
                                    error={!!errors.projectUrl}
                                    helperText={errors.projectUrl?.message || 'Optional: Link to live project'}
                                    placeholder="https://example.com"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Launch />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="githubUrl"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="GitHub Repository URL"
                                    type="url"
                                    error={!!errors.githubUrl}
                                    helperText={errors.githubUrl?.message || 'Optional: Link to source code'}
                                    placeholder="https://github.com/username/repo"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <GitHub />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.startDate}
                                    helperText={errors.startDate?.message || 'When did the project start?'}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Completion Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.endDate}
                                    helperText={errors.endDate?.message || 'When was the project completed?'}
                                />
                            )}
                        />
                    </Grid>

                    {/* Project Images */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                            <Image />
                            Project Images
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <ImageUpload
                            onImagesChange={setProjectImages}
                            existingImages={projectImages}
                            maxImages={10}
                            maxSize={10}
                        />
                    </Grid>

                    {/* SEO & Settings */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
                            <Settings />
                            SEO & Settings
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                SEO fields are auto-generated from your title and description, but you can customize them.
                            </Typography>
                        </Alert>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="seoTitle"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="SEO Title"
                                    error={!!errors.seoTitle}
                                    helperText={
                                        errors.seoTitle?.message ||
                                        `${field.value?.length || 0}/60 characters (optimal: 50-60)`
                                    }
                                    placeholder="Optimized title for search engines"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Controller
                            name="seoDescription"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="SEO Description"
                                    multiline
                                    rows={3}
                                    error={!!errors.seoDescription}
                                    helperText={
                                        errors.seoDescription?.message ||
                                        `${field.value?.length || 0}/160 characters (optimal: 150-160)`
                                    }
                                    placeholder="Brief description for search results"
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="seoKeywords"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.seoKeywords}>
                                    <InputLabel>SEO Keywords</InputLabel>
                                    <Select
                                        {...field}
                                        multiple
                                        input={<OutlinedInput label="SEO Keywords" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {seoKeywords.map((keyword) => (
                                            <MenuItem key={keyword} value={keyword}>
                                                <Checkbox checked={field.value.indexOf(keyword) > -1} />
                                                <ListItemText primary={keyword} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.seoKeywords && (
                                        <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                                            {errors.seoKeywords.message}
                                        </Typography>
                                    )}
                                </FormControl>
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="featured"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={field.value}
                                            onChange={field.onChange}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Star fontSize="small" />
                                                Featured Project
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Featured projects are highlighted on the main portfolio page
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ alignItems: 'flex-start' }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Project Summary */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
                            <Typography variant="h6" gutterBottom>
                                Project Summary
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <Typography variant="body2">
                                            <strong>Title:</strong> {watchedFields.title || 'Not set'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Category:</strong> {
                                                categories.find(c => c.value === watchedFields.category)?.label || 'Not set'
                                            }
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Status:</strong> {watchedFields.status || 'Not set'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Client:</strong> {watchedFields.client || 'Not specified'}
                                        </Typography>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <Typography variant="body2">
                                            <strong>Technologies:</strong> {
                                                watchedFields.technologies?.length > 0
                                                    ? `${watchedFields.technologies.length} selected`
                                                    : 'None selected'
                                            }
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Images:</strong> {projectImages.length} uploaded
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Featured:</strong> {watchedFields.featured ? 'Yes' : 'No'}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Content:</strong> {
                                                (() => {
                                                    const overview = watchedFields.overview?.length || 0;
                                                    const features = watchedFields.keyFeatures?.filter(f => f.trim()).length || 0;
                                                    const technical = watchedFields.technicalImplementation?.length || 0;

                                                    if (overview + features + technical === 0) return 'Not written';

                                                    const parts = [];
                                                    if (overview > 0) parts.push(`Overview: ${overview} chars`);
                                                    if (features > 0) parts.push(`${features} features`);
                                                    if (technical > 0) parts.push(`Technical: ${technical} chars`);

                                                    return parts.join(', ');
                                                })()
                                            }
                                        </Typography>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Button
                        onClick={onCancel}
                        variant="outlined"
                        size="large"
                        startIcon={<Close />}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isLoading || isSubmitting}
                        variant="contained"
                        size="large"
                        startIcon={isLoading || isSubmitting ? <CircularProgress size={20} /> : <Save />}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            minWidth: 160,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                            }
                        }}
                    >
                        {isLoading || isSubmitting
                            ? 'Saving...'
                            : mode === 'edit'
                                ? 'Update Project'
                                : 'Create Project'
                        }
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default ProjectForm;