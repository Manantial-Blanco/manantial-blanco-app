'use client';

import { useState, useRef, useEffect } from 'react';
import { Dictionary, Locale } from '@/types';
import { NavigationHeader } from '@/components/layout/NavigationHeader';
import ImageUpload from '@/components/ui/ImageUpload';

interface RegisterPieceClientProps {
  dict: Dictionary;
  lang: Locale;
}

interface FormData {
  name: string;
  image: File | null;
  imagePreview: string | null;
  description: string;
  licensePrice: string;
  carrierCommunity: string;
  remixPermissions: string;
}

export default function RegisterPieceClient({ dict, lang }: RegisterPieceClientProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    image: null,
    imagePreview: null,
    description: '',
    licensePrice: '',
    carrierCommunity: '',
    remixPermissions: '',
  });

  const sectionRef = useRef<HTMLDivElement>(null);

  const totalSteps = 7;

  useEffect(() => {
    // Scroll to top when step changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File, preview: string) => {
    setFormData((prev) => ({ ...prev, image: file, imagePreview: preview }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#E8E8E8]">
      <NavigationHeader lang={lang} dict={dict} showPromoBar={false} onClosePromoBar={() => {}} />

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-black">Register Piece</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-8">
          <div className="bg-white rounded-lg shadow-sm max-w-5xl mx-auto relative">
            <div ref={sectionRef} className="transition-all duration-300 ease-in-out pb-24">
              {/* Step 1: Name */}
              {currentStep === 1 && (
                <div className="wizard-section min-h-[400px] flex items-center justify-center px-12 py-16">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-black text-center mb-8">
                      Let&apos;s get started! What is the name of your piece?
                    </h2>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ex. Alebrije Alado"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        maxLength={30}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="text-right mt-2 text-sm text-gray-500">
                        max. 30 characters
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Image Upload */}
              {currentStep === 2 && (
                <div className="wizard-section min-h-[400px] flex items-center justify-center px-12 py-16">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-black text-center mb-2">
                      Upload a representative image of your artwork
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                      Make sure the photo accurately reflects your piece — this image will be visible to potential clients and buyers.
                    </p>
                    <ImageUpload onUpload={handleImageUpload} currentImage={formData.imagePreview} />
                  </div>
                </div>
              )}

              {/* Step 3: Description */}
              {currentStep === 3 && (
                <div className="wizard-section min-h-[400px] flex items-center justify-center px-12 py-16">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-black text-center mb-2">
                      Briefly describe your piece — include its concept, materials, and inspiration.
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                      Provide a short overview of the artwork&apos;s concept, technique, and creative intent.
                    </p>
                    <div className="relative">
                      <textarea
                        placeholder="Provide a short overview of the artwork's concept, technique, and creative intent."
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        rows={6}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <button className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 0L8.5 4.5L13 7L8.5 9.5L7 14L5.5 9.5L1 7L5.5 4.5L7 0Z" fill="currentColor"/>
                        </svg>
                        Write with AI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: License Price */}
              {currentStep === 4 && (
                <div className="wizard-section min-h-[400px] flex items-center justify-center px-12 py-16">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-black text-center mb-2">
                      License price
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                      Set the amount you wish to charge for licensing this artwork.
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Enter amount (USD)"
                        value={formData.licensePrice}
                        onChange={(e) => updateFormData('licensePrice', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Carrier Community */}
              {currentStep === 5 && (
                <div className="wizard-section min-h-[400px] flex items-center justify-center px-12 py-16">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-black text-center mb-2">
                      Carrier Community
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                      Select the group or network your artwork belongs to for registration and licensing purposes.
                    </p>
                    <div className="relative">
                      <select
                        value={formData.carrierCommunity}
                        onChange={(e) => updateFormData('carrierCommunity', e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select</option>
                        <option value="Alebrijes">Alebrijes</option>
                        <option value="Other">Other</option>
                      </select>
                      <svg 
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                      >
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Remix Permissions */}
              {currentStep === 6 && (
                <div className="wizard-section min-h-[400px] flex items-center justify-center px-12 py-16">
                  <div className="w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold text-black text-center mb-2">
                      Remix permissions
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                      Allow others to create derivative works based on your piece.
                    </p>
                    <div className="relative">
                      <select
                        value={formData.remixPermissions}
                        onChange={(e) => updateFormData('remixPermissions', e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <svg 
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 20 20" 
                        fill="none"
                      >
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Summary */}
              {currentStep === 7 && (
                <div className="wizard-section min-h-[400px] px-12 py-16">
                  <div className="w-full max-w-2xl mx-auto">
                    <h2 className="text-2xl font-semibold text-black text-center mb-8">
                      Review your submission
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Piece Name - Editable */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Piece Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          maxLength={30}
                          className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Image Upload - Editable */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Artwork Image
                        </label>
                        <ImageUpload onUpload={handleImageUpload} currentImage={formData.imagePreview} />
                      </div>

                      {/* Description - Editable */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => updateFormData('description', e.target.value)}
                          rows={4}
                          className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {/* License Price - Editable */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          License price
                        </label>
                        <input
                          type="number"
                          placeholder="Enter amount (USD)"
                          value={formData.licensePrice}
                          onChange={(e) => updateFormData('licensePrice', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Carrier Community - Editable */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Carrier Community
                        </label>
                        <div className="relative">
                          <select
                            value={formData.carrierCommunity}
                            onChange={(e) => updateFormData('carrierCommunity', e.target.value)}
                            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select</option>
                            <option value="Alebrijes">Alebrijes</option>
                            <option value="Other">Other</option>
                          </select>
                          <svg 
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 20 20" 
                            fill="none"
                          >
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>

                      {/* Remix Permissions - Editable */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Remix permissions
                        </label>
                        <div className="relative">
                          <select
                            value={formData.remixPermissions}
                            onChange={(e) => updateFormData('remixPermissions', e.target.value)}
                            className="w-full px-6 py-4 border border-gray-300 rounded-lg text-base text-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                          <svg 
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 20 20" 
                            fill="none"
                          >
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="pt-4">
                        <p className="text-center text-sm text-gray-600">
                          By clicking Submit, you acknowledge that you have read, understood, and agree to be bound by the{' '}
                          <a href="#" className="text-blue-600 underline hover:text-blue-700">
                            Terms and Conditions
                          </a>
                          {' '}of Manantial Blanco.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar and Next Button - Fixed to wizard container */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
              <div className="py-4 px-12 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{currentStep} out of {totalSteps}</span>
                  <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={currentStep === totalSteps ? () => {
                    // Handle final submission
                    console.log('Submitting:', formData);
                  } : handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
                >
                  {currentStep === totalSteps ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
