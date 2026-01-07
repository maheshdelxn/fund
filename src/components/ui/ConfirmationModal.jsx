import { AlertTriangle, Info } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'होय, खात्री करा',
    cancelText = 'रद्द करा',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {type === 'danger' ? <AlertTriangle size={24} /> : <Info size={24} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white font-medium rounded-xl shadow-lg transition-all ${type === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
