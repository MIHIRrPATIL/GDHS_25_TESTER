import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  Users, 
  MessageCircle, 
  Calendar,
  Brain,
  Activity,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary-foreground mb-4">
            <Brain className="h-3 w-3 mr-1" />
            AI-Powered Medical Triage
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Advanced Medical Triage System
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline patient care with intelligent triage, real-time insights, and comprehensive medical workflows designed for modern healthcare professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate('/doctor/dashboard')}
              className="text-lg px-8"
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              Enter Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/doctor/add-conversation')}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Conversation
            </Button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="patient-card-hover cursor-pointer" onClick={() => navigate('/doctor/dashboard')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Patient Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive patient overview with AI insights, triage scores, and real-time status updates.
              </p>
            </CardContent>
          </Card>

          <Card className="patient-card-hover cursor-pointer" onClick={() => navigate('/doctor/add-conversation')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-accent" />
                </div>
                Dual Mic Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Record doctor-patient conversations with dual microphone setup and automated transcription.
              </p>
            </CardContent>
          </Card>

          <Card className="patient-card-hover cursor-pointer" onClick={() => navigate('/doctor/patient-schedule')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                Smart Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Intelligent patient and doctor scheduling with automated reminders and conflict detection.
              </p>
            </CardContent>
          </Card>

          <Card className="patient-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-warning" />
                </div>
                AI Clinical Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced AI-powered differential diagnosis suggestions and risk assessment tools.
              </p>
            </CardContent>
          </Card>

          <Card className="patient-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                Feature Extraction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Structured symptom and finding extraction with intelligent autocomplete and categorization.
              </p>
            </CardContent>
          </Card>

          <Card className="patient-card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-accent" />
                </div>
                Comprehensive Triage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete triage workflow with vital signs, assessment forms, and export capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
