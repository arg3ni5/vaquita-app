import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const commonClasses = {
  // Aplicando tus clases: rounded-3xl, shadow-xl y el borde sutil
  popup: 'rounded-3xl shadow-xl border border-slate-100 bg-white p-6 w-[95%] max-w-[380px]',

  // Título más pequeño (text-base es ~16px, text-lg es ~18px)
  title: 'text-base font-bold text-slate-800 pt-2 tracking-tight',

  // Cuerpo de texto en tamaño pequeño estándar (14px)
  htmlContainer: 'text-slate-500 text-sm font-medium leading-relaxed px-2 mt-1',

  // Botones más compactos para que no rompan la estética
  confirmButton: 'bg-[#5138ed] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all mx-1 mb-2',
  cancelButton: 'bg-slate-100 text-slate-500 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all mx-1 mb-2',

  actions: 'pt-4',
  icon: 'scale-75 mb-0'
};

export const showConfirm = async (title, text, icon = 'warning') => {
  return MySwal.fire({
    title,
    text,
    icon,
    iconColor: icon === 'warning' ? '#f59e0b' : '#5138ed', // Amber-500 para advertencias, Violeta para el resto
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    customClass: commonClasses,
    buttonsStyling: false,
    // ... resto de tu configuración
  });
};

export const showAlert = async (title, text, icon = 'info') => {
  return MySwal.fire({
    title,
    text,
    icon,
    iconColor: '#5138ed', // Color principal de Vaquita App
    confirmButtonText: 'Entendido',
    customClass: {
      ...commonClasses,
      confirmButton: commonClasses.confirmButton + ' min-w-[160px]'
    },
    buttonsStyling: false,
    showClass: { popup: 'animate__animated animate__zoomIn animate__faster' }
  });
};

export default MySwal;