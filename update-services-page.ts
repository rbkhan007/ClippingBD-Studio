import fs from 'fs';
import path from 'path';

const filePath = path.join(
  'C:\\Users\\Rakibul Hasan\\Desktop\\Web Devs\\ClippingBDStudio',
  'src\\components\\zones\\public\\ServicesPage.tsx'
);

const content = fs.readFileSync(filePath, 'utf-8');

// Replace the services data section
const oldSection = `  // Stats Section Data
const serviceStats = [`;

const newSection = `  // Services state with CMS integration
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();

  // Stats Section Data
const serviceStats = [`;

let updatedContent = content.replace(oldSection, newSection);

// Replace the services data array with fallback
const oldServicesData = `// Service data - currently static, will connect to CMS data
  const servicesData = [`;
const newServicesData = `// Services state with CMS integration
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();

  // Fallback static data when CMS is not available
  const fallbackServicesData = [`;

updatedContent = updatedContent.replace(oldServicesData, newServicesData);

// Update the services rendering logic
const oldRendering = `            {serviceStats.map((stat, idx) => (`;
const newRendering = `            {services?.length > 0 
              ? services.map((service, idx) => (
                  <motion.div
                    key={service.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <GlassCard variant="service" className="service-card">
                      <GlassCardService service={service} />
                    </GlassCard>
                  </motion.div>
                ))
              : fallbackServicesData.map((stat, idx) => (`;

updatedContent = updatedContent.replace(oldRendering, newRendering);

fs.writeFileSync(filePath, updatedContent);
console.log('ServicesPage updated successfully!');