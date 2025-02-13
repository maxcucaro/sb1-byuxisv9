import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class CompanyProfileService {
    async getProfile() {
        return handleError(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            const { data, error } = await supabase
                .from('company_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            return { success: true, data };
        }, 'recupero profilo aziendale');
    }

    async updateProfile(formData) {
        return handleError(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            const { data, error } = await supabase
                .from('company_profiles')
                .update(formData)
                .eq('user_id', user.id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento profilo aziendale');
    }

    async uploadLogo(file) {
        return handleError(async () => {
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('Il file è troppo grande. Dimensione massima: 2MB');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            // Upload file
            const fileExt = file.name.split('.').pop();
            const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(fileName);

            // Update profile
            const { error: updateError } = await supabase
                .from('company_profiles')
                .update({ logo_url: publicUrl })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            return { success: true, data: { publicUrl } };
        }, 'upload logo aziendale');
    }

    async removeLogo() {
        return handleError(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            // Get current logo URL
            const { data: profile } = await supabase
                .from('company_profiles')
                .select('logo_url')
                .eq('user_id', user.id)
                .single();

            if (profile?.logo_url) {
                const fileName = profile.logo_url.split('/').pop();
                
                // Remove file from storage
                const { error: removeError } = await supabase.storage
                    .from('logos')
                    .remove([fileName]);

                if (removeError) throw removeError;
            }

            // Update profile
            const { error: updateError } = await supabase
                .from('company_profiles')
                .update({ logo_url: null })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            return { success: true };
        }, 'rimozione logo aziendale');
    }

    async getLogo() {
        return handleError(async () => {
            const profile = await this.getProfile();
            if (!profile.success) throw new Error(profile.error);

            return { 
                success: true, 
                data: profile.data.logo_url 
            };
        }, 'recupero logo aziendale');
    }
}

export const companyProfileService = new CompanyProfileService();