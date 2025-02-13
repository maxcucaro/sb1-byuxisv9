import { supabase } from '../utils/supabaseClient.js';

class AuthService {
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Errore durante il login:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Errore durante il logout:', error);
            return { success: false, error: error.message };
        }
    }

    async changePassword(newPassword) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Errore durante il cambio password:', error);
            return { success: false, error: error.message };
        }
    }

    async getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            const { data, error } = await supabase
                .from('company_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Errore durante il recupero del profilo:', error);
            return { success: false, error: error.message };
        }
    }

    async submitRegistration(formData) {
        try {
            const { error } = await supabase
                .from('registration_requests')
                .insert([{
                    ragione_sociale: formData.ragioneSociale,
                    piva: formData.piva,
                    email: formData.email,
                    telefono: formData.telefono,
                    referente: formData.referente,
                    piano_richiesto: formData.piano,
                    note: formData.note
                }]);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Errore durante l\'invio della richiesta:', error);
            return { success: false, error: error.message };
        }
    }

    async hasFeature(feature) {
        try {
            const profile = await this.getProfile();
            if (!profile.success) return false;
            
            return profile.data.features?.[feature] === true;
        } catch (error) {
            console.error('Errore durante la verifica della feature:', error);
            return false;
        }
    }
}

export const authService = new AuthService();