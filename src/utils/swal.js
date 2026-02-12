import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showConfirm = async (title, text, icon = 'warning') => {
  return MySwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'rounded-[2rem] border-none shadow-2xl bg-white',
      title: 'text-xl font-black text-slate-800 pt-6',
      htmlContainer: 'text-slate-500 text-base font-medium',
      confirmButton: 'bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mx-2 mb-4',
      cancelButton: 'bg-slate-100 text-slate-500 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all mx-2 mb-4'
    },
    buttonsStyling: false
  });
};

export const showAlert = async (title, text, icon = 'info') => {
  return MySwal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'Entendido',
    customClass: {
      popup: 'rounded-[2rem] border-none shadow-2xl bg-white',
      title: 'text-xl font-black text-slate-800 pt-6',
      htmlContainer: 'text-slate-500 text-base font-medium',
      confirmButton: 'bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mb-4'
    },
    buttonsStyling: false
  });
};

export default MySwal;
