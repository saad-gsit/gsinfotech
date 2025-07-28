import * as yup from 'yup'

// Contact form validation schema
export const contactSchema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters'),

    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),

    company: yup
        .string()
        .max(100, 'Company name must not exceed 100 characters'),

    phone: yup
        .string()
        .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),

    service: yup
        .string()
        .required('Please select a service'),

    message: yup
        .string()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must not exceed 1000 characters')
})

// Project form validation schema
export const projectSchema = yup.object().shape({
    title: yup
        .string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(255, 'Title must not exceed 255 characters'),

    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),

    technologies: yup
        .array()
        .of(yup.string())
        .min(1, 'Select at least one technology'),

    category: yup
        .string()
        .required('Category is required'),

    project_url: yup
        .string()
        .url('Please enter a valid URL'),

    github_url: yup
        .string()
        .url('Please enter a valid GitHub URL')
})

// Team member validation schema
export const teamMemberSchema = yup.object().shape({
    name: yup
        .string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),

    position: yup
        .string()
        .required('Position is required')
        .max(100, 'Position must not exceed 100 characters'),

    email: yup
        .string()
        .email('Please enter a valid email address'),

    bio: yup
        .string()
        .max(500, 'Bio must not exceed 500 characters'),

    skills: yup
        .array()
        .of(yup.string())
})

// Blog post validation schema
export const blogPostSchema = yup.object().shape({
    title: yup
        .string()
        .required('Title is required')
        .min(5, 'Title must be at least 5 characters')
        .max(255, 'Title must not exceed 255 characters'),

    excerpt: yup
        .string()
        .max(300, 'Excerpt must not exceed 300 characters'),

    content: yup
        .string()
        .required('Content is required')
        .min(50, 'Content must be at least 50 characters'),

    category: yup
        .string()
        .required('Category is required'),

    tags: yup
        .array()
        .of(yup.string())
        .max(10, 'Maximum 10 tags allowed'),

    status: yup
        .string()
        .oneOf(['draft', 'published', 'archived'], 'Invalid status')
})