import { ProfileForm } from "@/components/profile/ProfileForm";
import { BusinessAccountRequest } from "@/components/profile/BusinessAccountRequest";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Profile() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center">Profile Settings</h1>
          
          {/* User Profile */}
          <ProfileForm />
          
          {/* Business Account Request */}
          <BusinessAccountRequest />
        </div>
      </div>
    </MainLayout>
  );
}