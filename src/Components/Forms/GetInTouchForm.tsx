"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiGlobe,
  FiDollarSign,
  FiTarget,
  FiMessageSquare,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { BsBuildings } from "react-icons/bs";

interface GetInTouchFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  businessWebsite: string;
  monthlyRevenue: string;
  fundingSought: string;
  businessDescription: string;
  hearAboutUs: string;
}

const GetInTouchForm: React.FC<GetInTouchFormProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    businessType: "",
    businessWebsite: "",
    monthlyRevenue: "",
    fundingSought: "",
    businessDescription: "",
    hearAboutUs: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Prevent body scroll when modal is open and inject custom scrollbar styles
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      // Inject custom scrollbar styles
      const style = document.createElement('style');
      style.id = 'custom-scrollbar-styles';
      style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #28aeec, #0ea5e9);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 4px rgba(40, 174, 236, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0ea5e9, #28aeec);
          box-shadow: 0 4px 8px rgba(40, 174, 236, 0.5);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #0284c7, #1e40af);
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #28aeec rgba(255, 255, 255, 0.1);
        }

        /* Custom Dropdown Styles */
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .custom-select:focus {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2328aeec' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        }

        .custom-select option {
          background: linear-gradient(135deg, rgba(40, 174, 236, 0.15), rgba(14, 165, 233, 0.1));
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 2px 0;
          backdrop-filter: blur(10px);
        }

        .custom-select option:hover {
          background: linear-gradient(135deg, rgba(40, 174, 236, 0.3), rgba(14, 165, 233, 0.2));
          color: #28aeec;
        }

        .custom-select option:checked {
          background: linear-gradient(135deg, #28aeec, #0ea5e9);
          color: white;
          font-weight: 600;
        }

        /* Enhanced dropdown for better browser support */
        .dropdown-wrapper {
          position: relative;
        }

        .dropdown-wrapper::after {
          content: '';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid rgba(255, 255, 255, 0.7);
          pointer-events: none;
          transition: all 0.3s ease;
        }

        .dropdown-wrapper:focus-within::after {
          border-top-color: #28aeec;
          transform: translateY(-50%) rotate(180deg);
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.style.overflow = "unset";

      // Remove custom scrollbar styles
      const existingStyle = document.getElementById('custom-scrollbar-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      const existingStyle = document.getElementById('custom-scrollbar-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isOpen]);

  const businessTypes = [
    "Technology",
    "Healthcare",
    "Finance",
    "Real Estate",
    "E-commerce",
    "Manufacturing",
    "Retail",
    "Food & Beverage",
    "Education",
    "Energy",
    "Agriculture",
    "Transportation",
    "Other",
  ];

  const revenueRanges = [
    "Under $10K",
    "$10K - $50K",
    "$50K - $100K",
    "$100K - $500K",
    "$500K - $1M",
    "$1M - $5M",
    "$5M - $10M",
    "Over $10M",
  ];

  const fundingRanges = [
    "Under $50K",
    "$50K - $100K",
    "$100K - $500K",
    "$500K - $1M",
    "$1M - $5M",
    "$5M - $10M",
    "Over $10M",
  ];

  const hearAboutOptions = [
    "Google Search",
    "Social Media",
    "Referral",
    "Industry Event",
    "Newsletter",
    "Partner",
    "Other",
  ];

  const steps = [
    {
      title: "Personal & Business Info",
      subtitle: "Tell us about yourself and your company",
      fields: [
        "fullName",
        "businessName",
        "email",
        "phone",
        "businessType",
        "businessWebsite",
      ],
    },
    {
      title: "Financial Information",
      subtitle: "Share your business financials and funding needs",
      fields: ["monthlyRevenue", "fundingSought"],
    },
    {
      title: "Business Details",
      subtitle: "Help us understand your business better",
      fields: ["businessDescription", "hearAboutUs"],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Partial<FormData> = {};
    const currentStepFields = steps[stepIndex].fields;

    currentStepFields.forEach((field) => {
      if (field === "fullName" && !formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (field === "businessName" && !formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (field === "email") {
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }
      }
      if (field === "businessType" && !formData.businessType) {
        newErrors.businessType = "Business type is required";
      }
      if (field === "monthlyRevenue" && !formData.monthlyRevenue) {
        newErrors.monthlyRevenue = "Monthly revenue is required";
      }
      if (field === "fundingSought" && !formData.fundingSought) {
        newErrors.fundingSought = "Funding amount is required";
      }
      if (field === "businessDescription") {
        if (!formData.businessDescription.trim()) {
          newErrors.businessDescription = "Business description is required";
        } else if (formData.businessDescription.trim().length < 50) {
          newErrors.businessDescription =
            "Please provide at least 50 characters";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Handle successful submission
      console.log("Form submitted:", formData);
      onClose();

      // Reset form
      setFormData({
        fullName: "",
        businessName: "",
        email: "",
        phone: "",
        businessType: "",
        businessWebsite: "",
        monthlyRevenue: "",
        fundingSought: "",
        businessDescription: "",
        hearAboutUs: "",
      });
      setCurrentStep(0);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (fieldName: string) => {
    const commonInputClasses = "w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-[#28aeec] py-4 px-0 text-white placeholder-white/60 font-poppins transition-all duration-300 focus:outline-none text-lg";
    const errorClasses = errors[fieldName as keyof FormData] ? "border-red-400" : "";

    switch (fieldName) {
      case 'fullName':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiUser className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`${commonInputClasses} ${errorClasses} pl-8`}
                placeholder="Full Name *"
              />
            </div>
            {errors.fullName && <p className="text-red-400 text-sm font-poppins">{errors.fullName}</p>}
          </motion.div>
        );

      case 'businessName':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="relative">
              <BsBuildings className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={`${commonInputClasses} ${errorClasses} pl-8`}
                placeholder="Business Name *"
              />
            </div>
            {errors.businessName && <p className="text-red-400 text-sm font-poppins">{errors.businessName}</p>}
          </motion.div>
        );

      case 'email':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiMail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`${commonInputClasses} ${errorClasses} pl-8`}
                placeholder="Email Address *"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm font-poppins">{errors.email}</p>}
          </motion.div>
        );

      case 'phone':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiPhone className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${commonInputClasses} pl-8`}
                placeholder="Phone Number (Optional)"
              />
            </div>
          </motion.div>
        );

      case 'businessType':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiBriefcase className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className={`${commonInputClasses} ${errorClasses} pl-8 appearance-none cursor-pointer custom-scrollbar`}
              >
                <option value="" className="bg-gray-800 text-white">Select Business Type *</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type} className="bg-gray-800 text-white">
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {errors.businessType && <p className="text-red-400 text-sm font-poppins">{errors.businessType}</p>}
          </motion.div>
        );

      case 'businessWebsite':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiGlobe className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="url"
                name="businessWebsite"
                value={formData.businessWebsite}
                onChange={handleInputChange}
                className={`${commonInputClasses} pl-8`}
                placeholder="Business Website (Optional)"
              />
            </div>
          </motion.div>
        );

      case 'monthlyRevenue':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiDollarSign className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <select
                name="monthlyRevenue"
                value={formData.monthlyRevenue}
                onChange={handleInputChange}
                className={`${commonInputClasses} ${errorClasses} pl-8 appearance-none cursor-pointer`}
              >
                <option value="" className="bg-gray-800 text-white">Average Monthly Revenue *</option>
                {revenueRanges.map((range) => (
                  <option key={range} value={range} className="bg-gray-800 text-white">
                    {range}
                  </option>
                ))}
              </select>
            </div>
            {errors.monthlyRevenue && <p className="text-red-400 text-sm font-poppins">{errors.monthlyRevenue}</p>}
          </motion.div>
        );

      case 'fundingSought':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiTarget className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <select
                name="fundingSought"
                value={formData.fundingSought}
                onChange={handleInputChange}
                className={`${commonInputClasses} ${errorClasses} pl-8 appearance-none cursor-pointer`}
              >
                <option value="" className="bg-gray-800 text-white">Funding Amount Seeking *</option>
                {fundingRanges.map((range) => (
                  <option key={range} value={range} className="bg-gray-800 text-white">
                    {range}
                  </option>
                ))}
              </select>
            </div>
            {errors.fundingSought && <p className="text-red-400 text-sm font-poppins">{errors.fundingSought}</p>}
          </motion.div>
        );

      case 'businessDescription':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiMessageSquare className="absolute left-0 top-3 text-white/70 w-5 h-5" />
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                rows={4}
                className={`${commonInputClasses} ${errorClasses} pl-8 resize-none min-h-[120px]`}
                placeholder="Tell us about your business and why you need funding... *"
              />
            </div>
            <div className="flex justify-between items-center">
              {errors.businessDescription && <p className="text-red-400 text-sm font-poppins">{errors.businessDescription}</p>}
              <p className="text-white/50 text-sm font-poppins ml-auto">
                {formData.businessDescription.length}/500
              </p>
            </div>
          </motion.div>
        );

      case 'hearAboutUs':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="relative">
              <FiUsers className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <select
                name="hearAboutUs"
                value={formData.hearAboutUs}
                onChange={handleInputChange}
                className={`${commonInputClasses} pl-8 appearance-none cursor-pointer`}
              >
                <option value="" className="bg-gray-800 text-white">How did you hear about Nexa? (Optional)</option>
                {hearAboutOptions.map((option) => (
                  <option key={option} value={option} className="bg-gray-800 text-white">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-gradient-to-br from-[#28aeec]/10 via-transparent to-sky-400/10 backdrop-blur-4xl rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="p-8 pb-6 relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
              >
                <FiX className="w-6 h-6 text-white" />
              </button>

              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-white uppercase font-space-grotesk mb-2"
                >
                  Get In Touch
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/70 font-poppins"
                >
                  {steps[currentStep].subtitle}
                </motion.p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-[#28aeec] text-white shadow-lg shadow-[#28aeec]/40'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-0.5 ml-2 transition-all duration-300 ${
                          index < currentStep ? 'bg-[#28aeec]' : 'bg-white/20'
                        }`}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.h3
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-semibold text-white font-space-grotesk text-center mb-8"
              >
                {steps[currentStep].title}
              </motion.h3>
            </div>

            {/* Form Content */}
            <div className="px-8 pb-8">
              <motion.form
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Current Step Fields */}
                <div className="space-y-8 min-h-[300px]">
                  {steps[currentStep].fields.map((fieldName) => (
                    <div key={fieldName}>
                      {renderField(fieldName)}
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons - Fixed at bottom */}
                <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl p-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-poppins font-medium transition-all duration-300 border ${
                      currentStep === 0
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border-white/10'
                        : 'bg-white/10 text-white cursor-pointer hover:bg-white/20 hover:scale-105 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  {currentStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-[#28aeec] to-sky-400 hover:from-[#28aeec]/90 hover:to-sky-400/90 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#28aeec]/40 font-poppins disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-[#28aeec]/40"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <FiChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-[#28aeec] to-sky-400 hover:from-[#28aeec]/90 hover:to-sky-400/90 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#28aeec]/40 font-poppins border border-[#28aeec]/40"
                    >
                      Next
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GetInTouchForm;