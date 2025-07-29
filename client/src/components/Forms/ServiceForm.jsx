// client/src/components/Forms/ServiceForm.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Typography,
    Switch,
    FormControlLabel,
    InputAdornment,
    IconButton,
    Divider,
    CircularProgress,
    Paper
} from '@mui/material';
import {
    Add,
    Delete,
    AttachMoney,
    Schedule,
    CloudUpload,
    Close,
    Web,
    PhoneAndroid,
    Computer,
    Palette,
    Engineering
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDropzone } from 'react-dropzone';

// Validation Schema
const serviceSchema = yup.object({
    name: yup.string()
        .required('Service name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(255, 'Name must be less than 255 characters'),
    short_description: yup.string()
        .required('Short description is required')
        .min(10, 'Short description must be at least 10 characters')
        .max(500, 'Short description must be less than 500 characters'),
    description: yup.string()
        .required('Description is required')
        .min(50, 'Description must be at least 50 characters'),
    category: yup.string()
        .required('Category is required'),
    features: yup.array()
        .of(yup.string().min(1, 'Feature cannot be empty'))
        .min(1, 'At least one feature is required'),
    technologies: yup.array()
        .of(yup.string().min(1, 'Technology cannot be empty'))
        .min(1, 'At least one technology is required'),
    starting_price: yup.number()
        .nullable()
        .min(0, 'Price cannot be negative')
});

// Image Upload Component
const ServiceImageUpload = ({ onImageChange, existingImage = null }) => {
    const [image, setImage] = useState(existingImage);
    const [uploading, setUploading] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
        },
        multiple: false,
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: async (acceptedFiles) => {
            setUploading(true);
            try {
                const file = acceptedFiles[0];
                const imageUrl = URL.createObjectURL(file);
                setImage(imageUrl);
                onImageChange(file);
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        }
    });

    const removeImage = () => {
        setImage(null);
        onImageChange(null);
    };

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Service Image
            </Typography>
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50'
                    }
                }}
            >
                <input {...getInputProps()} />
                {image ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={image}
                            alt="Service"
                            style={{
                                width: 200,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 8
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                            }}
                            sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                ) : (
                    <>
                        <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {isDragActive ? 'Drop service image here' : 'Upload service image'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            or click to select file (max 5MB)
                        </Typography>
                    </>
                )}
                {uploading && <CircularProgress sx={{ mt: 2 }} />}
            </Paper>
        </Box>
    );
};

const ServiceForm = ({
    open,
    onClose,
    onSubmit,
    editingService = null,
    loading = false
}) => {
    const [uploadedImage, setUploadedImage] = useState(null);

    const serviceCategories = [
        { value: 'web_development', label: 'Web Development', icon: <Web /> },
        { value: 'mobile_development', label: 'Mobile Development', icon: <PhoneAndroid /> },
        { value: 'custom_software', label: 'Custom Software', icon: <Computer /> },
        { value: 'ui_ux_design', label: 'UI/UX Design', icon: <Palette /> },
        { value: 'enterprise_solutions', label: 'Enterprise Solutions', icon: <Engineering /> }
    ];

    const availableTechnologies = [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'PHP',
        'JavaScript', 'TypeScript', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Firebase',
        'Flutter', 'React Native', 'Swift', 'Kotlin', 'Figma', 'Adobe XD',
        'Sketch', 'Photoshop', 'Illustrator'
    ];

    const pricingModels = [
        { value: 'fixed', label: 'Fixed Price' },
        { value: 'hourly', label: 'Hourly Rate' },
        { value: 'project_based', label: 'Project Based' },
        { value: 'monthly', label: 'Monthly Retainer' },
        { value: 'custom', label: 'Custom Quote' }
    ];

    // Form setup
    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: yupResolver(serviceSchema),
        defaultValues: {
            name: '',
            short_description: '',
            description: '',
            category: '',
            features: [],
            technologies: [],
            pricing_model: '',
            starting_price: '',
            price_currency: 'USD',
            estimated_timeline: '',
            is_featured: false,
            is_active: true,
            show_in_homepage: true,
            process_steps: []
        }
    });

    // Field arrays for dynamic lists
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
        control,
        name: 'features'
    });

    const { fields: processFields, append: appendProcess, remove: removeProcess } = useFieldArray({
        control,
        name: 'process_steps'
    });

    const { fields: technologyFields, append: appendTechnology, remove: removeTechnology } = useFieldArray({
        control,
        name: 'technologies'
    });

    // Reset form when editing service changes
    useEffect(() => {
        if (editingService) {
            reset({
                ...editingService,
                features: editingService.features || [],
                technologies: editingService.technologies || [],
                process_steps: editingService.process_steps || []
            });
        } else {
            reset({
                name: '',
                short_description: '',
                description: '',
                category: '',
                features: [],
                technologies: [],
                pricing_model: '',
                starting_price: '',
                price_currency: 'USD',
                estimated_timeline: '',
                is_featured: false,
                is_active: true,
                show_in_homepage: true,
                process_steps: []
            });
        }
        setUploadedImage(null);
    }, [editingService, reset]);

    const handleFormSubmit = async (data) => {
        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add all fields to FormData
            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    formData.append(key, JSON.stringify(data[key]));
                } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    formData.append(key, data[key]);
                }
            });

            // Add image if uploaded
            if (uploadedImage) {
                formData.append('featured_image', uploadedImage);
            }

            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: { minHeight: '80vh', maxHeight: '90vh' }
            }}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogTitle>
                    {editingService ? 'Edit Service' : 'Add New Service'}
                </DialogTitle>

                <DialogContent sx={{ overflow: 'auto' }}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {/* Service Image */}
                        <Grid item xs={12} md={4}>
                            <ServiceImageUpload
                                onImageChange={setUploadedImage}
                                existingImage={editingService?.featured_image}
                            />
                        </Grid>

                        {/* Basic Information */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" gutterBottom>
                                Basic Information
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Service Name"
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                                required
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.category}>
                                                <InputLabel>Category *</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Category *"
                                                >
                                                    {serviceCategories.map((category) => (
                                                        <MenuItem key={category.value} value={category.value}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                {React.cloneElement(category.icon, { sx: { fontSize: 20 } })}
                                                                {category.label}
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.category && (
                                                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 1 }}>
                                                        {errors.category.message}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Controller
                                        name="short_description"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                label="Short Description"
                                                error={!!errors.short_description}
                                                helperText={errors.short_description?.message || 'Brief summary for cards (max 500 characters)'}
                                                required
                                                multiline
                                                rows={2}
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
                                                helperText={errors.description?.message}
                                                required
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Technologies */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Technologies & Skills
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                {technologyFields.length > 0 && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {technologyFields.map((field, index) => (
                                            <Chip
                                                key={field.id}
                                                label={watch(`technologies.${index}`)}
                                                onDelete={() => removeTechnology(index)}
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                )}

                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={8}>
                                        <FormControl fullWidth>
                                            <InputLabel>Add Technology</InputLabel>
                                            <Select
                                                value=""
                                                label="Add Technology"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value && !watch('technologies').includes(value)) {
                                                        appendTechnology(value);
                                                    }
                                                }}
                                            >
                                                {availableTechnologies.map((tech) => (
                                                    <MenuItem
                                                        key={tech}
                                                        value={tech}
                                                        disabled={watch('technologies').includes(tech)}
                                                    >
                                                        {tech}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            placeholder="Custom technology"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const value = e.target.value.trim();
                                                    if (value && !watch('technologies').includes(value)) {
                                                        appendTechnology(value);
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {errors.technologies && (
                                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                        {errors.technologies.message}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* Features */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Service Features
                            </Typography>

                            {featureFields.map((field, index) => (
                                <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Controller
                                        name={`features.${index}`}
                                        control={control}
                                        render={({ field: inputField }) => (
                                            <TextField
                                                {...inputField}
                                                fullWidth
                                                label={`Feature ${index + 1}`}
                                                error={!!errors.features?.[index]}
                                                helperText={errors.features?.[index]?.message}
                                            />
                                        )}
                                    />
                                    <IconButton
                                        onClick={() => removeFeature(index)}
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}

                            <Button
                                variant="outlined"
                                onClick={() => appendFeature('')}
                                startIcon={<Add />}
                            >
                                Add Feature
                            </Button>

                            {errors.features && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                    {errors.features.message}
                                </Typography>
                            )}
                        </Grid>

                        {/* Process Steps */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Process Steps (Optional)
                            </Typography>

                            {processFields.map((field, index) => (
                                <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Controller
                                        name={`process_steps.${index}`}
                                        control={control}
                                        render={({ field: inputField }) => (
                                            <TextField
                                                {...inputField}
                                                fullWidth
                                                label={`Step ${index + 1}`}
                                            />
                                        )}
                                    />
                                    <IconButton
                                        onClick={() => removeProcess(index)}
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}

                            <Button
                                variant="outlined"
                                onClick={() => appendProcess('')}
                                startIcon={<Add />}
                            >
                                Add Step
                            </Button>
                        </Grid>

                        {/* Pricing */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Pricing Information (Optional)
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="pricing_model"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Pricing Model</InputLabel>
                                        <Select
                                            {...field}
                                            label="Pricing Model"
                                        >
                                            <MenuItem value="">Select pricing model</MenuItem>
                                            {pricingModels.map((model) => (
                                                <MenuItem key={model.value} value={model.value}>
                                                    {model.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="starting_price"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Starting Price"
                                        type="number"
                                        error={!!errors.starting_price}
                                        helperText={errors.starting_price?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AttachMoney />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="estimated_timeline"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Estimated Timeline"
                                        placeholder="e.g., 2-4 weeks, 1-3 months"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Schedule />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* Display Settings */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Display Settings
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="is_featured"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={field.onChange}
                                            />
                                        }
                                        label="Featured Service"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="is_active"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={field.onChange}
                                            />
                                        }
                                        label="Active Service"
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="show_in_homepage"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={field.value}
                                                onChange={field.onChange}
                                            />
                                        }
                                        label="Show in Homepage"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                            }
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={20} />
                        ) : (
                            editingService ? 'Update Service' : 'Add Service'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ServiceForm;