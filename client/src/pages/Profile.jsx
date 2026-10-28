import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { formatDate } from '../utils/dateFormatter';
import CustomButton from '../components/ui/CustomButton';

const InfoRow = ({ label, value }) => (
  <Box>
    <Typography variant="subtitle1" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

function Profile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', image: '' });
  const [saving, setSaving] = useState(false);

  const getProfile = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      setProfile(response);
      setForm({ name: response.name, image: response.image });
    } catch (error) {
      toast.error('Could not load your profile');
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSaving(true);
      await updateProfile(form);
      await getProfile();
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Could not update your profile');
    } finally {
      setSaving(false);
    }
  };

  const displayedAvatar = form.image || user?.image;

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar src={displayedAvatar} sx={{ width: 96, height: 96 }} />
            <Box>
              <Typography variant="h3" fontWeight={700}>
                {profile?.name || user?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile?.email || user?.email}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={profile?.role || user?.role} color="primary" size="small" />
                {profile?.verified && <Chip label="Verified" color="success" size="small" />}
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
              Account details
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Avatar image URL"
                name="image"
                value={form.image}
                onChange={handleChange}
                fullWidth
              />
              <CustomButton type="submit" disabled={saving} variant="contained" color="primary">
                {saving ? 'Saving...' : 'Save changes'}
              </CustomButton>
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Stack spacing={2}>
            <InfoRow
              label="Sign-in method"
              value={profile?.serviceProvider || user?.serviceProvider || 'email'}
            />
            {profile?.createdAt && (
              <InfoRow label="Member since" value={formatDate(profile.createdAt)} />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Profile;
