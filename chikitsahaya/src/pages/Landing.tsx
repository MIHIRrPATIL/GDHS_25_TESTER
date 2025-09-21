import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  Heart, 
  ArrowRight,
  Sparkles,
  Shield
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'doctor' | 'patient') => {
    // Navigate to sign-in page with role context
    navigate(`/signin?role=${role}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      rotateX: 2,
      rotateY: 2,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 20,
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl space-y-4"
        >
          <Badge variant="secondary" className="bg-primary/10 text-primary-foreground mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Medical Platform
          </Badge>
          
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Advanced Medical Triage System
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Streamline healthcare with intelligent triage, real-time insights, and comprehensive medical workflows.
          </p>
        </motion.div>
      </header>

      {/* Role Selection Cards */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full"
        >
          {/* Doctor Card */}
          <motion.div variants={cardVariants}>
            <motion.div
                variants={hoverVariants}
                whileHover="hover"
                whileTap="tap"
                whileFocus="hover"
                style={{ transformStyle: "preserve-3d" }}
                tabIndex={0}
                role="button"
                aria-label="Login as Doctor"
                onClick={() => handleRoleSelection('doctor')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoleSelection('doctor');
                  }
                }}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
                <div className="relative z-10 text-center pb-4 flex flex-col space-y-1.5 p-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">I'm a Doctor</h3>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    <Shield className="h-3 w-3 mr-1" />
                    Faster Triage
                  </Badge>
                </div>
                <div className="relative z-10 text-center space-y-4 p-6 pt-0">
                  <p className="text-muted-foreground">
                    Access comprehensive patient management, AI insights, dual-mic conversations, and advanced triage tools.
                  </p>
                  <ul className="text-sm text-muted-foreground text-left space-y-2">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      Patient dashboard with AI insights
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      Dual microphone conversations
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      Advanced scheduling system
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      Export capabilities
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-6"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Enter Doctor Portal
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
          </motion.div>

          {/* Patient Card */}
          <motion.div variants={cardVariants}>
            <motion.div
                variants={hoverVariants}
                whileHover="hover"
                whileTap="tap"
                whileFocus="hover"
                style={{ transformStyle: "preserve-3d" }}
                tabIndex={0}
                role="button"
                aria-label="Login as Patient"
                onClick={() => handleRoleSelection('patient')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoleSelection('patient');
                  }
                }}
                className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-success/5 opacity-50" />
                <div className="relative z-10 text-center pb-4 flex flex-col space-y-1.5 p-6">
                  <div className="mx-auto w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">I'm a Patient</h3>
                  <Badge variant="outline" className="w-fit mx-auto mt-2 border-accent text-accent">
                    <Heart className="h-3 w-3 mr-1" />
                    Guided Care
                  </Badge>
                </div>
                <div className="relative z-10 text-center space-y-4 p-6 pt-0">
                  <p className="text-muted-foreground">
                    Access your health dashboard, view appointments, manage prescriptions, and communicate with your care team.
                  </p>
                  <ul className="text-sm text-muted-foreground text-left space-y-2">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                      Personal health dashboard
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                      Secure messaging with doctors
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                      Prescription management
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                      Appointment scheduling
                    </li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Enter Patient Portal
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              className="px-2 h-auto font-normal text-sm text-primary"
              onClick={() => navigate('/signup?role=patient')}
            >
              Sign up here
            </Button>
            {' '}or{' '}
            <Button 
              variant="link" 
              className="px-2 h-auto font-normal text-sm"
              onClick={() => navigate('/demo')}
            >
              try demo mode
            </Button>
          </p>
          <p className="text-xs text-muted-foreground">
            This is a demonstration platform. All data is simulated for testing purposes.
          </p>
        </motion.div>
      </footer>
    </div>
  );
};

export default Landing;