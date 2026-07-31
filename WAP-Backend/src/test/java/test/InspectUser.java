package test;
import java.net.URL;
import java.net.URLClassLoader;
import java.io.File;
import java.lang.annotation.Annotation;

public class InspectUser {
    public static void main(String[] args) throws Exception {
        File file = new File("D:/WAP/WAP-Backend/target/classes");
        URL url = file.toURI().toURL();
        URLClassLoader classLoader = new URLClassLoader(new URL[]{url});
        Class<?> userClass = classLoader.loadClass("com.wap.entity.Project");
        System.out.println("Class loaded: " + userClass.getName());
        Annotation[] annotations = userClass.getAnnotations();
        System.out.println("Annotations count: " + annotations.length);
        for (Annotation a : annotations) {
            System.out.println(" - " + a.annotationType().getName());
        }
        System.out.println("Methods count: " + userClass.getDeclaredMethods().length);
    }
}
