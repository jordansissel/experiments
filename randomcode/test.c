#include <gtk/gtk.h>
#include <gdk/gdkx.h>

static void activate(GtkWidget *widget, gpointer data) {
  g_print("Display handle: %x\n", GDK_WINDOW_XDISPLAY(widget->window));
  g_print("Window id: %d\n", GDK_WINDOW_XID(widget->window));
} 

int main(int argc, char **argv) {
  GtkWidget *window;

  gtk_init (&argc, &argv);
  window = gtk_window_new (GTK_WINDOW_TOPLEVEL);

  g_signal_connect(G_OBJECT(window), "realize",
                   G_CALLBACK(activate), NULL);
  
  gtk_widget_show_all(window);
  gtk_main();
  return 0;
} 

